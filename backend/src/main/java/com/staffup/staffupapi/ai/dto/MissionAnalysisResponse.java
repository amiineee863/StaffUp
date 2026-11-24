package com.staffup.staffupapi.ai.dto;

import com.staffup.staffupapi.ai.ExtractionEngine;
import com.staffup.staffupapi.matching.dto.ConsultantMatch;
import com.staffup.staffupapi.skill.dto.SkillResponse;

import java.util.List;

public record MissionAnalysisResponse(
        ExtractionEngine engine,
        String summary,
        List<SkillResponse> skills,
        List<String> otherSkills,
        List<ConsultantMatch> matches
) {
}