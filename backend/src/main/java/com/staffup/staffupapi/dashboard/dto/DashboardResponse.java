package com.staffup.staffupapi.dashboard.dto;

import com.staffup.staffupapi.mission.MissionStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
        LocalDate date,
        long totalConsultants,
        long staffedConsultants,
        long benchConsultants,
        double staffingRate,
        Map<MissionStatus, Long> missionsByStatus,
        List<BenchConsultant> bench,
        List<UpcomingAvailability> upcomingAvailabilities,
        List<SkillGap> skillDemand
) {
}