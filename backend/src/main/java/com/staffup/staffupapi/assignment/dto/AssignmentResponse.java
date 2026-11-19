package com.staffup.staffupapi.assignment.dto;

import com.staffup.staffupapi.assignment.Assignment;

import java.time.Instant;
import java.time.LocalDate;

public record AssignmentResponse(
        Long id,
        Long consultantId,
        String consultantName,
        Long missionId,
        String missionTitle,
        String clientName,
        String role,
        LocalDate startDate,
        LocalDate endDate,
        Instant createdAt
) {
    public static AssignmentResponse from(Assignment a) {
        return new AssignmentResponse(
                a.getId(),
                a.getConsultant().getId(),
                a.getConsultant().getFirstName() + " " + a.getConsultant().getLastName(),
                a.getMission().getId(),
                a.getMission().getTitle(),
                a.getMission().getClientName(),
                a.getRole(),
                a.getStartDate(),
                a.getEndDate(),
                a.getCreatedAt()
        );
    }
}