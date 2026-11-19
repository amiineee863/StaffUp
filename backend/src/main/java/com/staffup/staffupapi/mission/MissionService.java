package com.staffup.staffupapi.mission;

import com.staffup.staffupapi.common.PageResponse;
import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.common.exception.ResourceNotFoundException;
import com.staffup.staffupapi.mission.dto.MissionRequest;
import com.staffup.staffupapi.mission.dto.MissionResponse;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MissionService {

    private final MissionRepository repository;
    private final SkillService skillService;

    public PageResponse<MissionResponse> findAll(MissionStatus status, Pageable pageable) {
        Page<Mission> page = (status == null)
                ? repository.findAll(pageable)
                : repository.findByStatus(status, pageable);
        return PageResponse.from(page.map(MissionResponse::from));
    }

    public MissionResponse findById(Long id) {
        return MissionResponse.from(getOrThrow(id));
    }

    @Transactional
    public MissionResponse create(MissionRequest request) {
        Mission mission = new Mission();
        applyRequest(mission, request);
        if (mission.getStatus() == null) {
            mission.setStatus(MissionStatus.OPEN);
        }
        return MissionResponse.from(repository.save(mission));
    }

    @Transactional
    public MissionResponse update(Long id, MissionRequest request) {
        Mission mission = getOrThrow(id);
        applyRequest(mission, request);
        return MissionResponse.from(mission);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Mission getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mission", id));
    }

    private void applyRequest(Mission mission, MissionRequest r) {
        if (r.endDate() != null && r.endDate().isBefore(r.startDate())) {
            throw new BusinessRuleException("La date de fin doit être postérieure ou égale à la date de début");
        }
        Set<Skill> skills = skillService.getEntities(r.requiredSkillIds());

        mission.setTitle(r.title().trim());
        mission.setClientName(r.clientName().trim());
        mission.setDescription(r.description());
        mission.setStartDate(r.startDate());
        mission.setEndDate(r.endDate());
        if (r.status() != null) {
            mission.setStatus(r.status());
        }
        mission.getRequiredSkills().retainAll(skills);
        mission.getRequiredSkills().addAll(skills);
    }
}