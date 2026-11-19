package com.staffup.staffupapi.assignment;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.ConsultantRepository;
import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionRepository;
import com.staffup.staffupapi.support.AbstractIntegrationTest;
import com.staffup.staffupapi.support.TestData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AssignmentControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ConsultantRepository consultantRepository;
    @Autowired
    private MissionRepository missionRepository;

    private Consultant consultant;
    private Mission mission;

    @BeforeEach
    void setUp() {
        consultant = consultantRepository.save(TestData.consultant("assign@test.dev"));
        mission = missionRepository.save(
                TestData.mission("Mission IT", LocalDate.of(2027, 1, 1), LocalDate.of(2027, 6, 30)));
    }

    @Test
    @DisplayName("POST crée l'affectation et la mission passe en STAFFED")
    void create_validAssignment_returns201AndStaffsMission() throws Exception {
        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson("2027-01-10", "2027-02-28")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.consultantName").value("Test Consultant"))
                .andExpect(jsonPath("$.missionTitle").value("Mission IT"));

        mockMvc.perform(get("/api/missions/{id}", mission.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("STAFFED"));
    }

    @Test
    @DisplayName("POST d'une affectation qui chevauche renvoie 409")
    void create_overlappingAssignment_returns409() throws Exception {
        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson("2027-01-10", "2027-02-28")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson("2027-02-15", "2027-03-31")))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST hors de la période de la mission renvoie 400")
    void create_outsideMissionPeriod_returns400() throws Exception {
        mockMvc.perform(post("/api/assignments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson("2026-12-01", "2027-01-31")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Règle métier non respectée"));
    }

    private String assignmentJson(String start, String end) {
        return """
                {
                  "consultantId": %d,
                  "missionId": %d,
                  "role": "Développeur",
                  "startDate": "%s",
                  "endDate": "%s"
                }
                """.formatted(consultant.getId(), mission.getId(), start, end);
    }
}