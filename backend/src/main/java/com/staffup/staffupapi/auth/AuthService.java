package com.staffup.staffupapi.auth;

import com.staffup.staffupapi.auth.dto.LoginRequest;
import com.staffup.staffupapi.auth.dto.LoginResponse;
import com.staffup.staffupapi.common.exception.InvalidCredentialsException;
import com.staffup.staffupapi.common.exception.ResourceNotFoundException;
import com.staffup.staffupapi.security.TokenService;
import com.staffup.staffupapi.user.AppUser;
import com.staffup.staffupapi.user.AppUserRepository;
import com.staffup.staffupapi.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public LoginResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .filter(AppUser::isEnabled)
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        String token = tokenService.generateToken(user);
        return new LoginResponse(token, "Bearer", tokenService.expiresInSeconds(), UserResponse.from(user));
    }

    public UserResponse me(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
    }
}