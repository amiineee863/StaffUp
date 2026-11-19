package com.staffup.staffupapi.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

@ConfigurationProperties(prefix = "staffup.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {

    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "staffup.jwt.secret doit faire au moins 32 octets (256 bits) pour HS256");
        }
        if (expiration == null) {
            expiration = Duration.ofHours(1);
        }
        if (issuer == null || issuer.isBlank()) {
            issuer = "staffup-api";
        }
    }
}