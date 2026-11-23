package com.staffup.staffupapi.matching;

import com.staffup.staffupapi.assignment.AssignmentRepository;
import com.staffup.staffupapi.common.exception.BusinessRuleException;
import com.staffup.staffupapi.consultant.ConsultantRepository;
import com.staffup.staffupapi.matching.dto.ConsultantMatch;
import com.staffup.staffupapi.matching.dto.MatchResult;
import com.staffup.staffupapi.mission.Mission;
import com.staffup.staffupapi.mission.MissionService;
import com.staffup.staffupapi.skill.Skill;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchingService {

    private static final int MAX_LIMIT = 50;

    private final MissionService missionService;
    private final ConsultantRepository consultantRepository;
    private final AssignmentRepository assignmentRepository;
    private final MatchingScorer scorer;

    public List<ConsultantMatch> matchForMission(Long missionId, int limit) {
        Mission mission = missionService.getEntity(missionId);
        LocalDate end = (mission.getEndDate() != null) ? mission.getEndDate() : mission.getStartDate().plusMonths(6);
        return rank(mission.getRequiredSkills(), mission.getStartDate(), end, limit);
    }

    /** Classe les consultants pour une liste de compétences et une période. Réutilisé à l'étape 9 (IA). */
    public List<ConsultantMatch> rank(Collection<Skill> requiredSkills, LocalDate start, LocalDate end, int limit) {
        if (requiredSkills == null || requiredSkills.isEmpty()) {
            throw new BusinessRuleException("Aucune compétence requise : impossible de calculer un matching");
        }
        int safeLimit = Math.clamp(limit, 1, MAX_LIMIT);

        Set<Long> skillIds = requiredSkills.stream().map(Skill::getId).collect(Collectors.toSet());
        Set<Long> busyIds = new HashSet<>(assignmentRepository.findBusyConsultantIds(start, end));

        return consultantRepository.findDistinctBySkillIds(skillIds).stream()
                .map(consultant -> {
                    MatchResult result = scorer.score(consultant, requiredSkills);
                    return ConsultantMatch.of(consultant, result, !busyIds.contains(consultant.getId()));
                })
                .sorted(Comparator.comparing(ConsultantMatch::available).reversed()
                        .thenComparing(ConsultantMatch::score, Comparator.reverseOrder())
                        .thenComparing(ConsultantMatch::consultantName))
                .limit(safeLimit)
                .toList();
    }
}