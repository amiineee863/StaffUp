package com.staffup.staffupapi.matching.dto;

import java.util.List;

public record MatchResult(int score, List<MatchedSkill> matchedSkills, List<String> missingSkills) {
}