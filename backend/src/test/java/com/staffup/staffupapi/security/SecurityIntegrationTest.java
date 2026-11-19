package com.staffup.staffupapi.security;

import com.jayway.jsonpath.JsonPath;
import com.staffup.staffupapi.consultant.Consultant;
import com.staffup.staffupapi.consultant.ConsultantRepository;
import com.staffup.staffupapi.skill.Skill;
import com.staffup.staffupapi.skill.SkillCategory;
import com.staffup.staffupapi.skill.SkillRepository;
import com.staffup.staffupapi.support.AbstractIntegrationTest;
import com.staffup.staffupapi.support.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SecurityIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ConsultantRepository consultantRepository;
    @Autowired
    private SkillRepository skillRepository;

    // ===== Authentification =====

    @Test
    @DisplayName("login valide : renvoie un JWT utilisable sur les routes protégées")
    void login_validCredentials_returnsUsableToken() throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "admin@staffup.dev", "password": "Password123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andReturn().getResponse().getContentAsString();

        String token = JsonPath.read(response, "$.accessToken");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@staffup.dev"));
    }

    @Test
    @DisplayName("login avec un mauvais mot de passe : 401")
    void login_wrongPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "admin@staffup.dev", "password": "mauvais"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Identifiants invalides"));
    }

    @Test
    @DisplayName("route protégée sans jeton : 401 au format ProblemDetail")
    void protectedRoute_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/consultants"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("route protégée avec un jeton falsifié : 401")
    void protectedRoute_withInvalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/consultants").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());
    }

    // ===== Autorisations par rôle =====

    @Test
    @DisplayName("un CONSULTANT peut lire la liste des consultants")
    void consultant_canRead() throws Exception {
        mockMvc.perform(get("/api/consultants").with(asConsultant(1L)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("un CONSULTANT ne peut pas créer de mission : 403")
    void consultant_cannotCreateMission() throws Exception {
        mockMvc.perform(post("/api/missions")
                        .with(asConsultant(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "X", "clientName": "Y", "startDate": "2027-01-01"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Accès refusé"));
    }

    @Test
    @DisplayName("un MANAGER ne peut pas gérer les comptes : 403")
    void manager_cannotAccessUsers() throws Exception {
        mockMvc.perform(get("/api/users").with(asRole("MANAGER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("un CONSULTANT peut modifier SES compétences, mais pas celles d'un autre")
    void consultant_canEditOwnSkillsOnly() throws Exception {
        Consultant me = consultantRepository.save(TestData.consultant("me@test.dev"));
        Consultant other = consultantRepository.save(TestData.consultant("other@test.dev"));
        Skill skill = new Skill();
        skill.setName("Skill de test");
        skill.setCategory(SkillCategory.OTHER);
        skill = skillRepository.save(skill);

        mockMvc.perform(put("/api/consultants/{id}/skills/{skillId}", me.getId(), skill.getId())
                        .with(asConsultant(me.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"level": 3}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/consultants/{id}/skills/{skillId}", other.getId(), skill.getId())
                        .with(asConsultant(me.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"level": 3}
                                """))
                .andExpect(status().isForbidden());
    }

    // ===== Helpers =====

    private RequestPostProcessor asRole(String role) {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_" + role));
    }

    private RequestPostProcessor asConsultant(Long consultantId) {
        return jwt()
                .jwt(token -> token.claim("consultantId", consultantId))
                .authorities(new SimpleGrantedAuthority("ROLE_CONSULTANT"));
    }
}