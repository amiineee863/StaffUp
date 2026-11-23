package com.staffup.staffupapi.dashboard.projection;

import com.staffup.staffupapi.mission.MissionStatus;

public record StatusCount(MissionStatus status, Long count) {
}