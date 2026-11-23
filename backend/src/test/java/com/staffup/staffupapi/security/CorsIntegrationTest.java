package com.staffup.staffupapi.security;

import com.staffup.staffupapi.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CorsIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("preflight depuis le front autorisé : 200 + en-tête Allow-Origin")
    void preflight_fromAllowedOrigin_isAccepted() throws Exception {
        mockMvc.perform(options("/api/consultants")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    @DisplayName("preflight depuis une origine inconnue : refusé")
    void preflight_fromUnknownOrigin_isRejected() throws Exception {
        mockMvc.perform(options("/api/consultants")
                        .header("Origin", "http://site-malveillant.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}