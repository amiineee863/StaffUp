package com.staffup.staffupapi.consultant.dto;

import com.staffup.staffupapi.consultant.ConsultantSkill;
import com.staffup.staffupapi.skill.SkillCategory;

public record ConsultantSkillResponse(Long skillId, String name, SkillCategory category, int level) {

    public static ConsultantSkillResponse from(ConsultantSkill cs) {
        return new ConsultantSkillResponse(
                cs.getSkill().getId(),
                cs.getSkill().getName(),
                cs.getSkill().getCategory(),
                cs.getLevel()
        );
    }
}