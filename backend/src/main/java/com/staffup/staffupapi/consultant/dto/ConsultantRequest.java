package com.staffup.staffupapi.consultant.dto;

import com.staffup.staffupapi.consultant.Seniority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ConsultantRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 150) String jobTitle,
        @NotNull Seniority seniority,
        LocalDate availableFrom
) {
    /** Constructeur compact : s'exécute à la création du record, donc AVANT la validation. */
    public ConsultantRequest {
        email = (email == null) ? null : email.trim();
    }
}