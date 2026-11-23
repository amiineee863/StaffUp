package com.staffup.staffupapi.matching;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.ConsultantSkill;
import com.staffup.staffupapi.matching.dto.MatchResult;
import com.staffup.staffupapi.matching.dto.MatchedSkill;
import com.staffup.staffupapi.skill.Skill;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calcule la compatibilité d'un consultant avec une liste de compétences requises.
 * Chaque compétence requise vaut (niveau / 5) si le consultant la possède, 0 sinon.
 * Score final = moyenne x 100, arrondi.
 */
@Component
public class MatchingScorer {

    public static final int MAX_LEVEL = 5;

    public MatchResult score(Consultant consultant, Collection<Skill> requiredSkills) {
        if (requiredSkills == null || requiredSkills.isEmpty()) {
            throw new IllegalArgumentException("La liste des compétences requises ne peut pas être vide");
        }

        Map<Long, Integer> levelsBySkillId = consultant.getSkills().stream()
                .collect(Collectors.toMap(cs -> cs.getSkill().getId(), ConsultantSkill::getLevel));

        List<MatchedSkill> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        int points = 0;

        List<Skill> sortedRequired = requiredSkills.stream()
                .sorted(Comparator.comparing(Skill::getName))
                .toList();

        for (Skill required : sortedRequired) {
            Integer level = levelsBySkillId.get(required.getId());
            if (level == null) {
                missing.add(required.getName());
            } else {
                matched.add(new MatchedSkill(required.getName(), level));
                points += Math.min(level, MAX_LEVEL);
            }
        }

        int score = (int) Math.round(100.0 * points / (MAX_LEVEL * requiredSkills.size()));
        return new MatchResult(score, matched, missing);
    }
}