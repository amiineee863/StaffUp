package com.staffup.staffupapi.consultant;

import com.staffup.staffupapi.common.PageResponse;
import com.staffup.staffupapi.common.exception.ConflictException;
import com.staffup.staffupapi.common.exception.ResourceNotFoundException;
import com.staffup.staffupapi.consultant.dto.ConsultantRequest;
import com.staffup.staffupapi.consultant.dto.ConsultantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultantService {

    private final ConsultantRepository repository;
    private final SkillService skillService;

    public PageResponse<ConsultantResponse> findAll(String search, Pageable pageable) {
        Page<Consultant> page = (search == null || search.isBlank())
                ? repository.findAll(pageable)
                : repository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                search.trim(), search.trim(), pageable);
        return PageResponse.from(page.map(ConsultantResponse::from));
    }

    public ConsultantResponse findById(Long id) {
        return ConsultantResponse.from(getOrThrow(id));
    }

    @Transactional
    public ConsultantResponse create(ConsultantRequest request) {
        String email = normalizeEmail(request.email());
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un consultant existe déjà avec l'email " + email);
        }
        Consultant consultant = new Consultant();
        applyRequest(consultant, request, email);
        return ConsultantResponse.from(repository.save(consultant));
    }

    @Transactional
    public ConsultantResponse update(Long id, ConsultantRequest request) {
        Consultant consultant = getOrThrow(id);
        String email = normalizeEmail(request.email());
        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ConflictException("Un autre consultant utilise déjà l'email " + email);
        }
        applyRequest(consultant, request, email);
        return ConsultantResponse.from(consultant);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    @Transactional
    public ConsultantResponse setSkill(Long consultantId, Long skillId, int level) {
        Consultant consultant = getOrThrow(consultantId);
        Skill skill = skillService.getEntity(skillId);
        consultant.setSkillLevel(skill, level);
        return ConsultantResponse.from(consultant);
    }

    @Transactional
    public void removeSkill(Long consultantId, Long skillId) {
        Consultant consultant = getOrThrow(consultantId);
        if (!consultant.removeSkill(skillId)) {
            throw new ResourceNotFoundException(
                    "Le consultant " + consultantId + " ne possède pas la compétence " + skillId);
        }
    }

    private Consultant getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant", id));
    }

    private void applyRequest(Consultant c, ConsultantRequest r, String normalizedEmail) {
        c.setFirstName(r.firstName().trim());
        c.setLastName(r.lastName().trim());
        c.setEmail(normalizedEmail);
        c.setJobTitle(r.jobTitle().trim());
        c.setSeniority(r.seniority());
        c.setAvailableFrom(r.availableFrom());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}