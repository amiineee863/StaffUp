package com.staffup.staffupapi.dashboard.dto;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.Seniority;

public record BenchConsultant(Long id, String name, String jobTitle, Seniority seniority) {

    public static BenchConsultant from(Consultant c) {
        return new BenchConsultant(c.getId(), c.getFirstName() + " " + c.getLastName(),
                c.getJobTitle(), c.getSeniority());
    }
}