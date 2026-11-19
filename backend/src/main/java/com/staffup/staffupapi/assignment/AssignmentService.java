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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository repository;
    private final ConsultantService consultantService;
    private final MissionService missionService;

    @Transactional
    public AssignmentResponse create(AssignmentRequest request) {
        // Règle 1 : cohérence des dates (avant tout accès à la base)
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessRuleException(
                    "La date de fin de l'affectation doit être postérieure ou égale à la date de début");
        }

        Consultant consultant = consultantService.getEntity(request.consultantId());
        Mission mission = missionService.getEntity(request.missionId());

        // Règle 2 : pas d'affectation sur une mission clôturée
        if (mission.getStatus() == MissionStatus.CLOSED) {
            throw new BusinessRuleException("Impossible d'affecter un consultant à une mission clôturée");
        }

        // Règle 3 : l'affectation doit tenir dans la période de la mission
        boolean startsBeforeMission = request.startDate().isBefore(mission.getStartDate());
        boolean endsAfterMission = mission.getEndDate() != null && request.endDate().isAfter(mission.getEndDate());
        if (startsBeforeMission || endsAfterMission) {
            throw new BusinessRuleException(
                    "La période d'affectation doit être comprise dans la période de la mission");
        }

        // Règle 4 : pas de chevauchement avec une autre affectation du consultant
        if (repository.existsOverlapping(consultant.getId(), request.startDate(), request.endDate())) {
            throw new ConflictException(
                    "Le consultant est déjà affecté sur une autre mission pendant cette période");
        }

        Assignment assignment = new Assignment();
        assignment.setConsultant(consultant);
        assignment.setMission(mission);
        assignment.setRole(request.role());
        assignment.setStartDate(request.startDate());
        assignment.setEndDate(request.endDate());
        Assignment saved = repository.save(assignment);

        // Règle 5 : une mission OPEN qui reçoit un consultant devient STAFFED
        if (mission.getStatus() == MissionStatus.OPEN) {
            mission.setStatus(MissionStatus.STAFFED);
        }

        return AssignmentResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        Assignment assignment = getOrThrow(id);
        Mission mission = assignment.getMission();

        repository.delete(assignment);

        // Règle 6 : plus aucune affectation -> la mission redevient OPEN
        if (mission.getStatus() == MissionStatus.STAFFED
                && !repository.existsByMissionIdAndIdNot(mission.getId(), assignment.getId())) {
            mission.setStatus(MissionStatus.OPEN);
        }
    }

    public List<AssignmentResponse> findAll(Long consultantId, Long missionId) {
        List<Assignment> assignments;
        if (consultantId != null) {
            assignments = repository.findByConsultantIdOrderByStartDateAsc(consultantId);
        } else if (missionId != null) {
            assignments = repository.findByMissionIdOrderByStartDateAsc(missionId);
        } else {
            assignments = repository.findAll(Sort.by("startDate"));
        }
        return assignments.stream().map(AssignmentResponse::from).toList();
    }

    public AssignmentResponse findById(Long id) {
        return AssignmentResponse.from(getOrThrow(id));
    }

    private Assignment getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation", id));
    }
}