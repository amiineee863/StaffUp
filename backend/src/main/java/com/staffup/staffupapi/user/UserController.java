package com.staffup.staffupapi.user;

import com.staffup.staffupapi.user.dto.CreateUserRequest;
import com.staffup.staffupapi.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestion des comptes (ADMIN uniquement)")
public class UserController {

    private final UserService service;

    @GetMapping
    @Operation(summary = "Lister les comptes")
    public List<UserResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer un compte")
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return service.create(request);
    }
}