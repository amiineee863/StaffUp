package com.staffup.staffupapi.dashboard.dto;

/** Pour une compétence : combien de missions ouvertes la demandent, combien de consultants l'ont. */
public record SkillGap(String skill, long openMissions, long consultants) {
}