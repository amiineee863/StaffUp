package com.staffup.staffupapi.skill;

import com.staffup.staffupapi.skill.dto.SkillRequest;
import com.staffup.staffupapi.skill.dto.SkillResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Référentiel des compétences")
public class SkillController {

    private final SkillService service;

    @GetMapping
    @Operation(summary = "Lister les compétences (filtre optionnel par catégorie)")
    public List<SkillResponse> findAll(@RequestParam(required = false) SkillCategory category) {
        return service.findAll(category);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une compétence")
    public SkillResponse create(@Valid @RequestBody SkillRequest request) {
        return service.create(request);
    }
}