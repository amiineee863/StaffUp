package com.staffup.staffupapi.dashboard.dto;

import com.staffup.staffupapi.assignment.Assignment;

import java.time.LocalDate;

public record UpcomingAvailability(Long consultantId, String consultantName, String missionTitle, LocalDate endDate) {

    public static UpcomingAvailability from(Assignment a) {
        return new UpcomingAvailability(
                a.getConsultant().getId(),
                a.getConsultant().getFirstName() + " " + a.getConsultant().getLastName(),
                a.getMission().getTitle(),
                a.getEndDate()
        );
    }
}