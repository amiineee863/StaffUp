package com.staffup.staffupapi.ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record MissionAnalysisRequest(
        @NotBlank @Size(min = 20, max = 5000) String description,
        LocalDate startDate,
        LocalDate endDate,
        @Min(1) @Max(50) Integer limit
) {
}