package com.staffup.staffupapi.ai;

import com.staffup.staffupapi.ai.dto.MissionAnalysisRequest;
import com.staffup.staffupapi.ai.dto.MissionAnalysisResponse;
import com.staffup.staffupapi.matching.MatchingService;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillCategory;
import com.staffup.staffupapi.skill.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MissionAnalysisServiceTest {

    @Mock
    private SkillRepository skillRepository;
    @Mock
    private MatchingService matchingService;
    @Mock
    private ObjectProvider<LlmSkillExtractor> llmProvider;
    @Mock
    private LlmSkillExtractor llmExtractor;

    private MissionAnalysisService service;

    @BeforeEach
    void setUp() {
        service = new MissionAnalysisService(skillRepository, matchingService,
                new KeywordSkillExtractor(), llmProvider, Clock.systemDefaultZone());

        Skill java = new Skill();
        java.setId(1L);
        java.setName("Java");
        java.setCategory(SkillCategory.BACKEND);
        when(skillRepository.findAllByOrderByNameAsc()).thenReturn(List.of(java));
        when(matchingService.rank(any(), any(), any(), anyInt())).thenReturn(List.of());
    }

    @Test
    @DisplayName("utilise le LLM quand il est disponible")
    void usesLlmWhenAvailable() {
        when(llmProvider.getIfAvailable()).thenReturn(llmExtractor);
        when(llmExtractor.extract(anyString(), anyList()))
                .thenReturn(new SkillExtraction(List.of("Java"), List.of("Quarkus"), "Besoin Java", ExtractionEngine.LLM));

        MissionAnalysisResponse response = service.analyze(request("Mission Java et Quarkus pour un client."));

        assertThat(response.engine()).isEqualTo(ExtractionEngine.LLM);
        assertThat(response.otherSkills()).containsExactly("Quarkus");
        assertThat(response.summary()).isEqualTo("Besoin Java");
    }

    @Test
    @DisplayName("se replie sur les mots-clés si le LLM échoue")
    void fallsBackToKeywordsWhenLlmFails() {
        when(llmProvider.getIfAvailable()).thenReturn(llmExtractor);
        when(llmExtractor.extract(anyString(), anyList())).thenThrow(new RuntimeException("Ollama injoignable"));

        MissionAnalysisResponse response = service.analyze(request("Nous cherchons un profil Java confirmé."));

        assertThat(response.engine()).isEqualTo(ExtractionEngine.KEYWORDS);
        assertThat(response.skills()).extracting("name").containsExactly("Java");
    }

    @Test
    @DisplayName("utilise les mots-clés quand l'IA est désactivée")
    void usesKeywordsWhenLlmDisabled() {
        when(llmProvider.getIfAvailable()).thenReturn(null);

        MissionAnalysisResponse response = service.analyze(request("Nous cherchons un profil Java confirmé."));

        assertThat(response.engine()).isEqualTo(ExtractionEngine.KEYWORDS);
    }

    private static MissionAnalysisRequest request(String text) {
        return new MissionAnalysisRequest(text, LocalDate.of(2027, 1, 4), LocalDate.of(2027, 6, 30), 10);
    }
}