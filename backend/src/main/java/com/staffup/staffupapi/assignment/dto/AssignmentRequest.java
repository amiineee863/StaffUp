package com.staffup.staffupapi.assignment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AssignmentRequest(
        @NotNull Long consultantId,
        @NotNull Long missionId,
        @Size(max = 100) String role,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate
) {
}