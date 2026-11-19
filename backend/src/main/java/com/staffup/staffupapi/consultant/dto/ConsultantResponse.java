package com.staffup.staffupapi.consultant.dto;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.Seniority;

import java.time.Instant;
import java.time.LocalDate;

public record ConsultantResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String jobTitle,
        Seniority seniority,
        LocalDate availableFrom,
        Instant createdAt,
        Instant updatedAt
) {
    public static ConsultantResponse from(Consultant c) {
        return new ConsultantResponse(
                c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(),
                c.getJobTitle(), c.getSeniority(), c.getAvailableFrom(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}