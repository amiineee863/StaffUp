package com.staffup.staffupapi.matching.dto;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.Seniority;

import java.util.List;

public record ConsultantMatch(
        Long consultantId,
        String consultantName,
        String jobTitle,
        Seniority seniority,
        int score,
        boolean available,
        List<MatchedSkill> matchedSkills,
        List<String> missingSkills
) {
    public static ConsultantMatch of(Consultant c, MatchResult result, boolean available) {
        return new ConsultantMatch(
                c.getId(),
                c.getFirstName() + " " + c.getLastName(),
                c.getJobTitle(),
                c.getSeniority(),
                result.score(),
                available,
                result.matchedSkills(),
                result.missingSkills()
        );
    }
}