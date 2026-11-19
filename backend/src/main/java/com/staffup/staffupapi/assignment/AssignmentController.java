package com.staffup.staffupapi.assignment;

import com.staffup.staffupapi.assignment.dto.AssignmentRequest;
import com.staffup.staffupapi.assignment.dto.AssignmentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Affectation des consultants aux missions")
public class AssignmentController {

    private final AssignmentService service;

    @GetMapping
    @Operation(summary = "Lister les affectations (filtre optionnel par consultant ou par mission)")
    public List<AssignmentResponse> findAll(@RequestParam(required = false) Long consultantId,
                                            @RequestParam(required = false) Long missionId) {
        return service.findAll(consultantId, missionId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une affectation")
    public AssignmentResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Affecter un consultant à une mission")
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request) {
        AssignmentResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une affectation")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}