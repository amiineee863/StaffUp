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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class AssignmentRepositoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private ConsultantRepository consultantRepository;
    @Autowired
    private MissionRepository missionRepository;

    private Consultant consultant;

    /** Situation de départ : le consultant est affecté du 01/03/2027 au 31/03/2027. */
    @BeforeEach
    void setUp() {
        consultant = consultantRepository.save(TestData.consultant("overlap@test.dev"));
        Mission mission = missionRepository.save(
                TestData.mission("Mission test", LocalDate.of(2027, 1, 1), LocalDate.of(2027, 12, 31)));
        assignmentRepository.save(
                TestData.assignment(consultant, mission, LocalDate.of(2027, 3, 1), LocalDate.of(2027, 3, 31)));
    }

    @ParameterizedTest(name = "[{0} → {1}] chevauche le mois de mars : {2}")
    @CsvSource({
            "2027-03-10, 2027-03-20, true",   // incluse dans l'affectation existante
            "2027-02-15, 2027-03-05, true",   // déborde avant
            "2027-03-25, 2027-04-10, true",   // déborde après
            "2027-02-01, 2027-04-30, true",   // englobe l'affectation existante
            "2027-03-31, 2027-04-15, true",   // commence le dernier jour (bornes incluses)
            "2027-02-01, 2027-02-28, false",  // se termine juste avant
            "2027-04-01, 2027-04-30, false"   // commence juste après
    })
    void existsOverlapping_detectsAllCases(LocalDate start, LocalDate end, boolean expected) {
        assertThat(assignmentRepository.existsOverlapping(consultant.getId(), start, end))
                .isEqualTo(expected);
    }

    @Test
    @DisplayName("ne tient pas compte des affectations des autres consultants")
    void existsOverlapping_ignoresOtherConsultants() {
        Consultant other = consultantRepository.save(TestData.consultant("other@test.dev"));

        boolean overlap = assignmentRepository.existsOverlapping(
                other.getId(), LocalDate.of(2027, 3, 1), LocalDate.of(2027, 3, 31));

        assertThat(overlap).isFalse();
    }
}