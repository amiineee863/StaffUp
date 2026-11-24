package com.staffup.staffupapi.ai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class KeywordSkillExtractorTest {

    private static final List<String> CATALOG =
            List.of("Java", "Spring Boot", "Kubernetes", "PostgreSQL", "Node.js", "React", "Scrum");

    private final KeywordSkillExtractor extractor = new KeywordSkillExtractor();

    @Test
    @DisplayName("trouve les compétences, y compris en plusieurs mots, sans tenir compte de la casse")
    void findsSkillsCaseInsensitive() {
        SkillExtraction result = extractor.extract("Développeur JAVA / spring boot, méthode scrum.", CATALOG);

        assertThat(result.skills()).containsExactly("Java", "Scrum", "Spring Boot");
        assertThat(result.engine()).isEqualTo(ExtractionEngine.KEYWORDS);
    }

    @Test
    @DisplayName("ne confond pas Java et JavaScript (mot entier uniquement)")
    void matchesWholeWordsOnly() {
        SkillExtraction result = extractor.extract("Expert JavaScript et TypeScript.", CATALOG);

        assertThat(result.skills()).doesNotContain("Java");
    }

    @Test
    @DisplayName("reconnaît les alias courants (k8s, postgres, nodejs)")
    void resolvesAliases() {
        SkillExtraction result = extractor.extract("Déploiement k8s, base postgres, API en nodejs.", CATALOG);

        assertThat(result.skills()).containsExactly("Kubernetes", "Node.js", "PostgreSQL");
    }

    @Test
    @DisplayName("ne renvoie pas de doublon")
    void noDuplicates() {
        SkillExtraction result = extractor.extract("React, React, et encore reactjs.", CATALOG);

        assertThat(result.skills()).containsExactly("React");
    }
}