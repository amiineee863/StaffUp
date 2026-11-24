package com.staffup.staffupapi.ai;

import com.staffup.staffupapi.ai.dto.MissionAnalysisRequest;
import com.staffup.staffupapi.ai.dto.MissionAnalysisResponse;
import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.matching.MatchingService;
import com.staffup.staffupapi.matching.dto.ConsultantMatch;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillRepository;
import com.staffup.staffupapi.skill.dto.SkillResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Analyse d'une fiche de mission : extraction des compétences (IA ou mots-clés), puis matching.
 *
 * Volontairement SANS @Transactional : l'appel au LLM peut durer plusieurs secondes,
 * on ne garde pas une connexion à la base ouverte pendant ce temps.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MissionAnalysisService {

    private static final int DEFAULT_LIMIT = 10;

    private final SkillRepository skillRepository;
    private final MatchingService matchingService;
    private final KeywordSkillExtractor keywordExtractor;
    private final ObjectProvider<LlmSkillExtractor> llmExtractor;
    private final Clock clock;

    public MissionAnalysisResponse analyze(MissionAnalysisRequest request) {
        LocalDate start = (request.startDate() != null) ? request.startDate() : LocalDate.now(clock);
        LocalDate end = (request.endDate() != null) ? request.endDate() : start.plusMonths(6);
        if (end.isBefore(start)) {
            throw new BusinessRuleException("La date de fin doit être postérieure ou égale à la date de début");
        }
        int limit = (request.limit() != null) ? request.limit() : DEFAULT_LIMIT;

        List<Skill> catalog = skillRepository.findAllByOrderByNameAsc();
        List<String> catalogNames = catalog.stream().map(Skill::getName).toList();

        SkillExtraction extraction = extract(request.description(), catalogNames);

        Map<String, Skill> skillsByLowerName = catalog.stream()
                .collect(Collectors.toMap(s -> s.getName().toLowerCase(Locale.ROOT), Function.identity()));
        List<Skill> skills = extraction.skills().stream()
                .map(name -> skillsByLowerName.get(name.toLowerCase(Locale.ROOT)))
                .filter(Objects::nonNull)
                .toList();

        List<ConsultantMatch> matches = skills.isEmpty()
                ? List.of()
                : matchingService.rank(skills, start, end, limit);

        return new MissionAnalysisResponse(
                extraction.engine(),
                extraction.summary(),
                skills.stream().map(SkillResponse::from).toList(),
                extraction.otherSkills(),
                matches
        );
    }

    /** L'IA si elle est disponible ; sinon, ou en cas d'erreur, l'analyse par mots-clés. */
    private SkillExtraction extract(String text, List<String> catalog) {
        LlmSkillExtractor llm = llmExtractor.getIfAvailable();
        if (llm != null) {
            try {
                return llm.extract(text, catalog);
            } catch (RuntimeException ex) {
                log.warn("Extraction IA indisponible, repli sur l'analyse par mots-clés : {}", ex.getMessage());
            }
        }
        return keywordExtractor.extract(text, catalog);
    }
}