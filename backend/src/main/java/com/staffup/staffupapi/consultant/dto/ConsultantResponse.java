package com.staffup.staffupapi.consultant.dto;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.Seniority;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record ConsultantResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String jobTitle,
        Seniority seniority,
        LocalDate availableFrom,
        List<ConsultantSkillResponse> skills,
        Instant createdAt,
        Instant updatedAt
) {
    public static ConsultantResponse from(Consultant c) {
        List<ConsultantSkillResponse> skills = c.getSkills().stream()
                .map(ConsultantSkillResponse::from)
                .sorted(Comparator.comparingInt(ConsultantSkillResponse::level).reversed()
                        .thenComparing(ConsultantSkillResponse::name))
                .toList();

        return new ConsultantResponse(
                c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(),
                c.getJobTitle(), c.getSeniority(), c.getAvailableFrom(),
                skills, c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}