package com.staffup.staffupapi.mission.dto;

import com.staffup.staffupapi.mission.MissionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Set;

public record MissionRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank @Size(max = 150) String clientName,
        @Size(max = 5000) String description,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        MissionStatus status,
        Set<Long> requiredSkillIds
) {
}