package com.sabores.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sabores.dto.request.AuthRequest;
import com.sabores.dto.response.Responses.AuthResponse;
import com.sabores.dto.response.Responses.UserResponse;
import com.sabores.security.JwtAuthenticationFilter;
import com.sabores.security.JwtService;
import com.sabores.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AuthService authService;
    // Required by SecurityConfig even in a slice test
    @MockBean
    JwtService jwtService;

    private static final UserResponse FAKE_USER =
            new UserResponse(1L, "Jane Doe", "jane@sabores.com", "USER");
    private static final AuthResponse FAKE_RESPONSE =
            new AuthResponse("jwt-token-value", FAKE_USER);

    // -----------------------------------------------------------------------
    // POST /auth/register  → 201 Created
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("POST /auth/register returns 201 with a token in the body")
    @WithMockUser
    void register_returns201WithToken() throws Exception {
        AuthRequest.Register req = new AuthRequest.Register("Jane Doe", "jane@sabores.com", "password123");
        given(authService.register(any(AuthRequest.Register.class))).willReturn(FAKE_RESPONSE);

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token-value"));
    }

    // -----------------------------------------------------------------------
    // POST /auth/login  → 200 OK
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("POST /auth/login returns 200 with a token in the body")
    @WithMockUser
    void login_returns200WithToken() throws Exception {
        AuthRequest.Login req = new AuthRequest.Login("jane@sabores.com", "password123");
        given(authService.login(any(AuthRequest.Login.class))).willReturn(FAKE_RESPONSE);

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-value"));
    }
}
