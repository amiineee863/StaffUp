package com.staffup.staffupapi.auth.dto;

import com.staffup.staffupapi.user.dto.UserResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}