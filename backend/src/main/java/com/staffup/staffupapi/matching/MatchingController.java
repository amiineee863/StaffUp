package com.staffup.staffupapi.matching;

import com.staffup.staffupapi.matching.dto.ConsultantMatch;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions/{missionId}/matches")
@RequiredArgsConstructor
@Tag(name = "Matching", description = "Recherche des consultants les plus adaptés à une mission")
public class MatchingController {

    private final MatchingService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Classer les consultants par compatibilité avec la mission")
    public List<ConsultantMatch> matches(@PathVariable Long missionId,
                                         @RequestParam(defaultValue = "10") int limit) {
        return service.matchForMission(missionId, limit);
    }
}