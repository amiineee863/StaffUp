package com.staffup.staffupapi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/** Règle d'accès utilisée dans les @PreAuthorize : qui peut modifier une fiche consultant ? */
@Component("consultantAccess")
public class ConsultantAccess {

    public boolean canEdit(Authentication authentication, Long consultantId) {
        if (authentication == null) {
            return false;
        }
        boolean privileged = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if (privileged) {
            return true;
        }
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Object claim = jwtAuth.getToken().getClaims().get("consultantId");
            return claim instanceof Number n && n.longValue() == consultantId;
        }
        return false;
    }
}