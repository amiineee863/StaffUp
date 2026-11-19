package com.staffup.staffupapi.consultant;

import com.staffup.staffupapi.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser(roles = "MANAGER")
class ConsultantControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("GET /api/consultants renvoie les consultants de démo triés par nom")
    void list_returnsSeededConsultantsSortedByLastName() throws Exception {
        mockMvc.perform(get("/api/consultants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(5))
                .andExpect(jsonPath("$.content[0].lastName").value("Benali"))
                .andExpect(jsonPath("$.content[0].skills").isArray());
    }

    @Test
    @DisplayName("GET /api/consultants?search= filtre par nom")
    void list_withSearch_filtersByName() throws Exception {
        mockMvc.perform(get("/api/consultants").param("search", "mar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].email").value("julie.martin@staffup.dev"));
    }

    @Test
    @DisplayName("POST crée le consultant, renvoie 201 + Location et normalise l'email")
    void create_validRequest_returns201() throws Exception {
        String body = """
                {
                  "firstName": "Lucas",
                  "lastName": "Petit",
                  "email": "  Lucas.Petit@StaffUp.dev ",
                  "jobTitle": "Développeur Spring Boot",
                  "seniority": "JUNIOR",
                  "availableFrom": "2027-04-01"
                }
                """;

        mockMvc.perform(post("/api/consultants").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/consultants/")))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value("lucas.petit@staffup.dev"))
                .andExpect(jsonPath("$.skills").isEmpty());
    }

    @Test
    @DisplayName("POST avec un email déjà utilisé renvoie 409")
    void create_duplicateEmail_returns409() throws Exception {
        String body = """
                {
                  "firstName": "Sarah",
                  "lastName": "Doublon",
                  "email": "SARAH.LEFEBVRE@staffup.dev",
                  "jobTitle": "Développeuse",
                  "seniority": "JUNIOR"
                }
                """;

        mockMvc.perform(post("/api/consultants").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflit"));
    }

    @Test
    @DisplayName("POST invalide renvoie 400 avec le détail des champs en erreur")
    void create_invalidRequest_returns400WithFieldErrors() throws Exception {
        String body = """
                {
                  "firstName": "",
                  "lastName": "Petit",
                  "email": "pas-un-email",
                  "jobTitle": "Dev",
                  "seniority": "JUNIOR"
                }
                """;

        mockMvc.perform(post("/api/consultants").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @DisplayName("GET d'un id inconnu renvoie 404 au format ProblemDetail")
    void findById_unknown_returns404() throws Exception {
        mockMvc.perform(get("/api/consultants/{id}", 999_999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").value(containsString("introuvable")));
    }
}