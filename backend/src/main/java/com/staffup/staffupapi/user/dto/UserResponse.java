package com.staffup.staffupapi.user.dto;

import com.staffup.staffupapi.user.AppUser;
import com.staffup.staffupapi.user.Role;

public record UserResponse(Long id, String email, Role role, Long consultantId) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getConsultant() == null ? null : user.getConsultant().getId()
        );
    }
}