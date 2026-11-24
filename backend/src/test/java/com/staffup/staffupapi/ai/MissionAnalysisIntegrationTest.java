package com.staffup.staffupapi.ai;

import com.staffup.staffupapi.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WithMockUser(roles = "MANAGER")
class MissionAnalysisIntegrationTest extends AbstractIntegrationTest {

    private static final String BODY = """
            {
              "description": "Nous recherchons un développeur Java / Spring Boot pour une refonte d'API. Base PostgreSQL, échanges via Kafka.",
              "startDate": "2027-01-04",
              "endDate": "2027-06-30"
            }
            """;

    @Test
    @DisplayName("sans IA activée : extraction par mots-clés puis matching")
    void analyze_withoutLlm_usesKeywordsAndMatches() throws Exception {
        mockMvc.perform(post("/api/missions/analyze").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.engine").value("KEYWORDS"))
                .andExpect(jsonPath("$.skills.length()").value(4))
                .andExpect(jsonPath("$.matches[0].consultantName").value("Karim Benali"))
                .andExpect(jsonPath("$.matches[0].score").value(55));
    }

    @Test
    @WithMockUser(roles = "CONSULTANT")
    @DisplayName("un CONSULTANT n'a pas accès à l'analyse : 403")
    void analyze_forConsultant_returns403() throws Exception {
        mockMvc.perform(post("/api/missions/analyze").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isForbidden());
    }
}