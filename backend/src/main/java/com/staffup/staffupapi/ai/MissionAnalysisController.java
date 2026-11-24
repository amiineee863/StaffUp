package com.staffup.staffupapi.ai;

import com.staffup.staffupapi.ai.dto.MissionAnalysisRequest;
import com.staffup.staffupapi.ai.dto.MissionAnalysisResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/missions/analyze")
@RequiredArgsConstructor
@Tag(name = "AI", description = "Analyse de fiches de mission")
public class MissionAnalysisController {

    private final MissionAnalysisService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Extraire les compétences d'une fiche de mission et proposer des consultants")
    public MissionAnalysisResponse analyze(@Valid @RequestBody MissionAnalysisRequest request) {
        return service.analyze(request);
    }
}