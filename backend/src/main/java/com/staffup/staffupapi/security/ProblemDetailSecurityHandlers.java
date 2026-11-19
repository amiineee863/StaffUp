package com.staffup.staffupapi.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Renvoie les erreurs 401 et 403 au même format ProblemDetail que le reste de l'API.
 * Ces erreurs se produisent dans les filtres de sécurité, AVANT les controllers :
 * notre GlobalExceptionHandler ne les voit donc pas.
 */
@Component
public class ProblemDetailSecurityHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        response.setHeader("WWW-Authenticate", "Bearer");
        write(response, request, 401, "Non authentifié",
                "Authentification requise : jeton absent, invalide ou expiré");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        write(response, request, 403, "Accès refusé",
                "Vous n'avez pas les droits nécessaires pour cette action");
    }

    private void write(HttpServletResponse response, HttpServletRequest request,
                       int status, String title, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
                {"type":"about:blank","title":"%s","status":%d,"detail":"%s","instance":"%s"}"""
                .formatted(title, status, detail, request.getRequestURI()));
    }
}