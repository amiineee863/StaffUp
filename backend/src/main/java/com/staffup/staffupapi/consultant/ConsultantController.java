package com.staffup.staffupapi.consultant;

import com.staffup.staffupapi.common.PageResponse;
import com.staffup.staffupapi.consultant.dto.ConsultantRequest;
import com.staffup.staffupapi.consultant.dto.ConsultantResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springdoc.core.annotations.ParameterObject;
import com.staffup.staffupapi.consultant.dto.ConsultantSkillRequest;

import java.net.URI;

@RestController
@RequestMapping("/api/consultants")
@RequiredArgsConstructor
@Tag(name = "Consultants", description = "Gestion des consultants")
public class ConsultantController {

    private final ConsultantService service;

    @GetMapping
    @Operation(summary = "Lister les consultants (paginé, recherche par nom)")
    public PageResponse<ConsultantResponse> findAll(
            @RequestParam(required = false) String search,
            @ParameterObject
            @PageableDefault(size = 20, sort = "lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        return service.findAll(search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un consultant")
    public ConsultantResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Créer un consultant")
    public ResponseEntity<ConsultantResponse> create(@Valid @RequestBody ConsultantRequest request) {
        ConsultantResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un consultant")
    public ConsultantResponse update(@PathVariable Long id, @Valid @RequestBody ConsultantRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un consultant")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/skills/{skillId}")
    @Operation(summary = "Ajouter une compétence à un consultant ou modifier son niveau")
    public ConsultantResponse setSkill(@PathVariable Long id,
                                       @PathVariable Long skillId,
                                       @Valid @RequestBody ConsultantSkillRequest request) {
        return service.setSkill(id, skillId, request.level());
    }

    @DeleteMapping("/{id}/skills/{skillId}")
    @Operation(summary = "Retirer une compétence d'un consultant")
    public ResponseEntity<Void> removeSkill(@PathVariable Long id, @PathVariable Long skillId) {
        service.removeSkill(id, skillId);
        return ResponseEntity.noContent().build();
    }
}