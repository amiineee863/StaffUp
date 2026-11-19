package com.staffup.staffupapi.mission;

import com.staffup.staffupapi.common.PageResponse;
import com.staffup.staffupapi.mission.dto.MissionRequest;
import com.staffup.staffupapi.mission.dto.MissionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
@Tag(name = "Missions", description = "Gestion des missions client")
public class MissionController {

    private final MissionService service;

    @GetMapping
    @Operation(summary = "Lister les missions (paginé, filtre optionnel par statut)")
    public PageResponse<MissionResponse> findAll(
            @RequestParam(required = false) MissionStatus status,
            @ParameterObject
            @PageableDefault(size = 20, sort = "startDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return service.findAll(status, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une mission")
    public MissionResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Créer une mission")
    public ResponseEntity<MissionResponse> create(@Valid @RequestBody MissionRequest request) {
        MissionResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une mission")
    public MissionResponse update(@PathVariable Long id, @Valid @RequestBody MissionRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une mission")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}