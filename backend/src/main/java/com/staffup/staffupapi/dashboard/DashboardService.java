package com.staffup.staffupapi.dashboard;

import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.dashboard.dto.BenchConsultant;
import com.staffup.staffupapi.dashboard.dto.DashboardResponse;
import com.staffup.staffupapi.dashboard.dto.SkillGap;
import com.staffup.staffupapi.dashboard.dto.UpcomingAvailability;
import com.staffup.staffupapi.dashboard.projection.SkillSupply;
import com.staffup.staffupapi.mission.MissionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int AVAILABILITY_HORIZON_DAYS = 30;

    private final DashboardQueries queries;
    private final Clock clock;

    public DashboardResponse getDashboard(LocalDate date) {
        LocalDate day = (date != null) ? date : LocalDate.now(clock);

        // Staffing
        long total = queries.countConsultants();
        List<Consultant> bench = queries.findConsultantsOnBench(day);
        long staffed = total - bench.size();
        double staffingRate = (total == 0) ? 0.0 : Math.round(1000.0 * staffed / total) / 10.0;

        // Missions par statut (tous les statuts présents, même à 0)
        Map<MissionStatus, Long> missionsByStatus = new EnumMap<>(MissionStatus.class);
        for (MissionStatus status : MissionStatus.values()) {
            missionsByStatus.put(status, 0L);
        }
        queries.countMissionsByStatus().forEach(sc -> missionsByStatus.put(sc.status(), sc.count()));

        // Prochaines disponibilités
        List<UpcomingAvailability> upcoming = queries
                .findAssignmentsEndingBetween(day, day.plusDays(AVAILABILITY_HORIZON_DAYS)).stream()
                .map(UpcomingAvailability::from)
                .toList();

        // Demande (missions ouvertes) vs offre (consultants) par compétence
        Map<Long, Long> supplyBySkill = queries.countConsultantsBySkill().stream()
                .collect(Collectors.toMap(SkillSupply::skillId, SkillSupply::consultantCount));
        List<SkillGap> skillDemand = queries.findSkillDemand(MissionStatus.OPEN).stream()
                .map(d -> new SkillGap(d.skillName(), d.missionCount(), supplyBySkill.getOrDefault(d.skillId(), 0L)))
                .toList();

        return new DashboardResponse(
                day, total, staffed, bench.size(), staffingRate,
                missionsByStatus,
                bench.stream().map(BenchConsultant::from).toList(),
                upcoming,
                skillDemand
        );
    }
}