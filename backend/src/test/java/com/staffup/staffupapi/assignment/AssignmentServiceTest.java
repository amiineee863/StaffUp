package com.staffup.staffupapi.assignment;

import com.staffup.staffupapi.assignment.dto.AssignmentRequest;
import com.staffup.staffupapi.assignment.dto.AssignmentResponse;
import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.common.exception.ConflictException;
import com.staffup.staffupapi.common.exception.ResourceNotFoundException;
import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.ConsultantService;
import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionService;
import com.staffup.staffupapi.mission.MissionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    private static final LocalDate MISSION_START = LocalDate.of(2027, 1, 1);
    private static final LocalDate MISSION_END = LocalDate.of(2027, 6, 30);

    @Mock
    private AssignmentRepository repository;
    @Mock
    private ConsultantService consultantService;
    @Mock
    private MissionService missionService;

    @InjectMocks
    private AssignmentService service;

    private Consultant consultant;
    private Mission mission;

    @BeforeEach
    void setUp() {
        consultant = new Consultant();
        consultant.setId(1L);
        consultant.setFirstName("Sarah");
        consultant.setLastName("Lefebvre");

        mission = new Mission();
        mission.setId(10L);
        mission.setTitle("API de facturation");
        mission.setClientName("Client Test");
        mission.setStartDate(MISSION_START);
        mission.setEndDate(MISSION_END);
        mission.setStatus(MissionStatus.OPEN);
    }

    // ====================== create ======================

    @Test
    @DisplayName("crée l'affectation et passe la mission OPEN en STAFFED")
    void create_validRequest_savesAssignmentAndStaffsMission() {
        givenConsultantAndMissionExist();
        when(repository.existsOverlapping(1L, MISSION_START, MISSION_END)).thenReturn(false);
        when(repository.save(any(Assignment.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignmentResponse response = service.create(request(MISSION_START, MISSION_END));

        ArgumentCaptor<Assignment> captor = ArgumentCaptor.forClass(Assignment.class);
        verify(repository).save(captor.capture());
        Assignment saved = captor.getValue();
        assertThat(saved.getConsultant()).isSameAs(consultant);
        assertThat(saved.getMission()).isSameAs(mission);
        assertThat(saved.getRole()).isEqualTo("Développeuse back");

        assertThat(response.consultantName()).isEqualTo("Sarah Lefebvre");
        assertThat(response.missionTitle()).isEqualTo("API de facturation");
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.STAFFED);
    }

    @Test
    @DisplayName("refuse une affectation dont la date de fin précède la date de début")
    void create_endBeforeStart_throwsBusinessRule() {
        AssignmentRequest invalid = request(LocalDate.of(2027, 3, 1), LocalDate.of(2027, 2, 1));

        assertThatThrownBy(() -> service.create(invalid))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("date de fin");

        verifyNoInteractions(consultantService, missionService, repository);
    }

    @Test
    @DisplayName("refuse une affectation sur une mission clôturée")
    void create_closedMission_throwsBusinessRule() {
        mission.setStatus(MissionStatus.CLOSED);
        givenConsultantAndMissionExist();

        assertThatThrownBy(() -> service.create(request(MISSION_START, MISSION_END)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("clôturée");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("refuse une affectation qui commence avant la mission")
    void create_startsBeforeMission_throwsBusinessRule() {
        givenConsultantAndMissionExist();

        assertThatThrownBy(() -> service.create(request(MISSION_START.minusDays(1), MISSION_END)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("période de la mission");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("refuse une affectation qui se termine après la mission")
    void create_endsAfterMission_throwsBusinessRule() {
        givenConsultantAndMissionExist();

        assertThatThrownBy(() -> service.create(request(MISSION_START, MISSION_END.plusDays(1))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("période de la mission");

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("accepte n'importe quelle date de fin si la mission n'a pas de date de fin")
    void create_missionWithoutEndDate_acceptsAnyEnd() {
        mission.setEndDate(null);
        LocalDate farEnd = LocalDate.of(2030, 12, 31);
        givenConsultantAndMissionExist();
        when(repository.existsOverlapping(1L, MISSION_START, farEnd)).thenReturn(false);
        when(repository.save(any(Assignment.class))).thenAnswer(inv -> inv.getArgument(0));

        AssignmentResponse response = service.create(request(MISSION_START, farEnd));

        assertThat(response.endDate()).isEqualTo(farEnd);
    }

    @Test
    @DisplayName("refuse si le consultant est déjà affecté sur une période qui chevauche")
    void create_overlappingAssignment_throwsConflict() {
        givenConsultantAndMissionExist();
        when(repository.existsOverlapping(1L, MISSION_START, MISSION_END)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request(MISSION_START, MISSION_END)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("déjà affecté");

        verify(repository, never()).save(any());
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.OPEN);
    }

    // ====================== delete ======================

    @Test
    @DisplayName("repasse la mission en OPEN quand on supprime sa dernière affectation")
    void delete_lastAssignment_reopensMission() {
        mission.setStatus(MissionStatus.STAFFED);
        Assignment assignment = existingAssignment();
        when(repository.findById(100L)).thenReturn(Optional.of(assignment));
        when(repository.existsByMissionIdAndIdNot(10L, 100L)).thenReturn(false);

        service.delete(100L);

        verify(repository).delete(assignment);
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.OPEN);
    }

    @Test
    @DisplayName("laisse la mission en STAFFED s'il reste d'autres affectations")
    void delete_otherAssignmentsRemain_keepsMissionStaffed() {
        mission.setStatus(MissionStatus.STAFFED);
        Assignment assignment = existingAssignment();
        when(repository.findById(100L)).thenReturn(Optional.of(assignment));
        when(repository.existsByMissionIdAndIdNot(10L, 100L)).thenReturn(true);

        service.delete(100L);

        verify(repository).delete(assignment);
        assertThat(mission.getStatus()).isEqualTo(MissionStatus.STAFFED);
    }

    @Test
    @DisplayName("lève une 404 si l'affectation n'existe pas")
    void delete_unknownAssignment_throwsNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).delete(any());
    }

    // ====================== helpers ======================

    private void givenConsultantAndMissionExist() {
        when(consultantService.getEntity(1L)).thenReturn(consultant);
        when(missionService.getEntity(10L)).thenReturn(mission);
    }

    private AssignmentRequest request(LocalDate start, LocalDate end) {
        return new AssignmentRequest(1L, 10L, "Développeuse back", start, end);
    }

    private Assignment existingAssignment() {
        Assignment a = new Assignment();
        a.setId(100L);
        a.setConsultant(consultant);
        a.setMission(mission);
        a.setStartDate(MISSION_START);
        a.setEndDate(MISSION_END);
        return a;
    }
}