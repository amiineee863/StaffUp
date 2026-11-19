package com.staffup.staffupapi.mission.dto;

import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionStatus;
import com.staffup.staffupapi.skill.dto.SkillResponse;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record MissionResponse(
        Long id,
        String title,
        String clientName,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        MissionStatus status,
        List<SkillResponse> requiredSkills,
        Instant createdAt,
        Instant updatedAt
) {
    public static MissionResponse from(Mission m) {
        List<SkillResponse> skills = m.getRequiredSkills().stream()
                .map(SkillResponse::from)
                .sorted(Comparator.comparing(SkillResponse::name))
                .toList();

        return new MissionResponse(
                m.getId(), m.getTitle(), m.getClientName(), m.getDescription(),
                m.getStartDate(), m.getEndDate(), m.getStatus(),
                skills, m.getCreatedAt(), m.getUpdatedAt()
        );
    }
}