package com.staffup.staffupapi.dashboard;

import com.staffup.staffupapi.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WithMockUser(roles = "MANAGER")
class DashboardIntegrationTest extends AbstractIntegrationTest {

    /**
     * Au 23/11/2026, avec les données de démo :
     *  - 5 consultants, dont Thomas et Inès en mission -> 2 staffés, 3 en intercontrat, 40 %
     *  - missions : 2 OPEN, 1 STAFFED, 0 CLOSED
     *  - Inès termine le 14/12/2026 (dans moins de 30 jours)
     *  - Spring Boot est demandé par les 2 missions ouvertes et maîtrisé par 2 consultants
     */
    @Test
    @DisplayName("renvoie les indicateurs de staffing à une date donnée")
    void dashboard_onGivenDate_returnsIndicators() throws Exception {
        mockMvc.perform(get("/api/dashboard").param("date", "2026-11-23"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalConsultants").value(5))
                .andExpect(jsonPath("$.staffedConsultants").value(2))
                .andExpect(jsonPath("$.benchConsultants").value(3))
                .andExpect(jsonPath("$.staffingRate").value(40.0))
                .andExpect(jsonPath("$.missionsByStatus.OPEN").value(2))
                .andExpect(jsonPath("$.missionsByStatus.STAFFED").value(1))
                .andExpect(jsonPath("$.missionsByStatus.CLOSED").value(0))
                .andExpect(jsonPath("$.upcomingAvailabilities.length()").value(1))
                .andExpect(jsonPath("$.upcomingAvailabilities[0].consultantName").value("Inès Moreau"))
                .andExpect(jsonPath("$.skillDemand[0].skill").value("Spring Boot"))
                .andExpect(jsonPath("$.skillDemand[0].openMissions").value(2))
                .andExpect(jsonPath("$.skillDemand[0].consultants").value(2));
    }

    @Test
    @WithMockUser(roles = "CONSULTANT")
    @DisplayName("un CONSULTANT n'a pas accès au dashboard : 403")
    void dashboard_forConsultant_returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isForbidden());
    }
}