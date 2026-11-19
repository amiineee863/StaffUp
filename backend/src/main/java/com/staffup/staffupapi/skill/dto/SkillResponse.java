package com.staffup.staffupapi.skill.dto;

import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillCategory;

public record SkillResponse(Long id, String name, SkillCategory category) {

    public static SkillResponse from(Skill skill) {
        return new SkillResponse(skill.getId(), skill.getName(), skill.getCategory());
    }
}