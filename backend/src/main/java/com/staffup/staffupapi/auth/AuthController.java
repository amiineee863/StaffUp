package com.staffup.staffupapi.auth;

import com.staffup.staffupapi.auth.dto.LoginRequest;
import com.staffup.staffupapi.auth.dto.LoginResponse;
import com.staffup.staffupapi.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @SecurityRequirements // pas de jeton requis pour cette route dans Swagger
    @Operation(summary = "Se connecter et obtenir un jeton JWT")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Utilisateur actuellement connecté")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.me(jwt.getSubject());
    }
}