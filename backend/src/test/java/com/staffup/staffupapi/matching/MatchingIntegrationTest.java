package com.staffup.staffupapi.matching;

import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionRepository;
import com.staffup.staffupapi.skill.SkillRepository;
import com.staffup.staffupapi.support.AbstractIntegrationTest;
import com.staffup.staffupapi.support.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WithMockUser(roles = "MANAGER")
class MatchingIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MissionRepository missionRepository;
    @Autowired
    private SkillRepository skillRepository;

    /**
     * Mission Java + Spring Boot + PostgreSQL + Kafka, du 04/01/2027 au 30/06/2027.
     * Données de démo :
     *  - Karim  : Java 4, Spring Boot 4, Kafka 3       -> 11/20 = 55, disponible
     *  - Sarah  : Java 4, Spring Boot 4, PostgreSQL 3  -> 11/20 = 55, disponible
     *  - Thomas : Java 4                               ->  4/20 = 20, affecté jusqu'au 14/02/2027
     */
    @Test
    @DisplayName("classe d'abord les disponibles, puis par score, puis par nom")
    void matches_rankAvailableFirstThenByScore() throws Exception {
        Mission mission = TestData.mission("Mission matching",
                LocalDate.of(2027, 1, 4), LocalDate.of(2027, 6, 30));
        for (String name : List.of("Java", "Spring Boot", "PostgreSQL", "Kafka")) {
            mission.getRequiredSkills().add(skillRepository.findByNameIgnoreCase(name).orElseThrow());
        }
        mission = missionRepository.save(mission);

        mockMvc.perform(get("/api/missions/{id}/matches", mission.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].consultantName").value("Karim Benali"))
                .andExpect(jsonPath("$[0].score").value(55))
                .andExpect(jsonPath("$[0].available").value(true))
                .andExpect(jsonPath("$[0].missingSkills[0]").value("PostgreSQL"))
                .andExpect(jsonPath("$[1].consultantName").value("Sarah Lefebvre"))
                .andExpect(jsonPath("$[1].missingSkills[0]").value("Kafka"))
                .andExpect(jsonPath("$[2].consultantName").value("Thomas Dubois"))
                .andExpect(jsonPath("$[2].score").value(20))
                .andExpect(jsonPath("$[2].available").value(false));
    }

    @Test
    @DisplayName("mission sans compétence requise : 400")
    void missionWithoutSkills_returns400() throws Exception {
        Mission mission = missionRepository.save(TestData.mission("Mission vide",
                LocalDate.of(2027, 1, 4), LocalDate.of(2027, 6, 30)));

        mockMvc.perform(get("/api/missions/{id}/matches", mission.getId()))
                .andExpect(status().isBadRequest());
    }
}