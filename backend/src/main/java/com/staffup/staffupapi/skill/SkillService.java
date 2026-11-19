package com.staffup.staffupapi.skill;

import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.common.exception.ConflictException;
import com.staffup.staffupapi.common.exception.ResourceNotFoundException;
import com.staffup.staffupapi.skill.dto.SkillRequest;
import com.staffup.staffupapi.skill.dto.SkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository repository;

    public List<SkillResponse> findAll(SkillCategory category) {
        List<Skill> skills = (category == null)
                ? repository.findAllByOrderByNameAsc()
                : repository.findByCategoryOrderByNameAsc(category);
        return skills.stream().map(SkillResponse::from).toList();
    }

    @Transactional
    public SkillResponse create(SkillRequest request) {
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("La compétence '" + name + "' existe déjà");
        }
        Skill skill = new Skill();
        skill.setName(name);
        skill.setCategory(request.category());
        return SkillResponse.from(repository.save(skill));
    }

    /** Utilisé par les autres services (consultant, mission). */
    public Skill getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compétence", id));
    }

    /** Charge plusieurs compétences et échoue si un id n'existe pas. */
    public Set<Skill> getEntities(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        List<Skill> found = repository.findAllById(ids);
        if (found.size() != ids.size()) {
            Set<Long> foundIds = found.stream().map(Skill::getId).collect(Collectors.toSet());
            Set<Long> missing = ids.stream().filter(id -> !foundIds.contains(id)).collect(Collectors.toSet());
            throw new BusinessRuleException("Compétences introuvables : " + missing);
        }
        return new HashSet<>(found);
    }
}