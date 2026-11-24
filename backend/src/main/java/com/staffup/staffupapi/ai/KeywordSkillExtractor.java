package com.staffup.staffupapi.ai;

import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Extraction déterministe par recherche des noms de compétences (et de quelques alias) dans le texte.
 * Toujours disponible : sert de repli quand l'IA est désactivée ou ne répond pas.
 */
@Component
public class KeywordSkillExtractor implements SkillExtractor {

    /** Variantes courantes -> nom du référentiel. */
    private static final Map<String, String> ALIASES = Map.of(
            "k8s", "Kubernetes",
            "postgres", "PostgreSQL",
            "springboot", "Spring Boot",
            "reactjs", "React",
            "react.js", "React",
            "nodejs", "Node.js",
            "angularjs", "Angular",
            "amazon web services", "AWS"
    );

    @Override
    public SkillExtraction extract(String text, List<String> skillCatalog) {
        String haystack = text.toLowerCase(Locale.ROOT);
        Map<String, String> catalogByLowerName = skillCatalog.stream()
                .collect(Collectors.toMap(name -> name.toLowerCase(Locale.ROOT), Function.identity(), (a, b) -> a));

        Set<String> found = new LinkedHashSet<>();

        catalogByLowerName.forEach((lowerName, name) -> {
            if (containsTerm(haystack, lowerName)) {
                found.add(name);
            }
        });

        ALIASES.forEach((alias, target) -> {
            String canonical = catalogByLowerName.get(target.toLowerCase(Locale.ROOT));
            if (canonical != null && containsTerm(haystack, alias)) {
                found.add(canonical);
            }
        });

        return new SkillExtraction(found.stream().sorted().toList(), List.of(), null, ExtractionEngine.KEYWORDS);
    }

    /** Terme entier uniquement : "java" ne doit pas correspondre à "javascript". */
    private static boolean containsTerm(String haystack, String term) {
        Pattern pattern = Pattern.compile("(?<![\\p{L}\\p{N}])" + Pattern.quote(term) + "(?![\\p{L}\\p{N}])");
        return pattern.matcher(haystack).find();
    }
}