package com.sabores.service;

import com.sabores.dto.request.AuthRequest;
import com.sabores.dto.response.Responses.AuthResponse;
import com.sabores.entity.User;
import com.sabores.exception.BusinessException;
import com.sabores.repository.UserRepository;
import com.sabores.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = User.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane@sabores.com")
                .password("hashed")
                .role(User.Role.USER)
                .build();
    }

    // -----------------------------------------------------------------------
    // register()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("register() throws BusinessException when email already exists")
    void register_throwsWhenEmailAlreadyExists() {
        AuthRequest.Register req = new AuthRequest.Register("Jane", "jane@sabores.com", "password123");
        given(userRepository.existsByEmail("jane@sabores.com")).willReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("email");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register() returns AuthResponse with a non-null token on success")
    void register_returnsAuthResponseWithToken() {
        AuthRequest.Register req = new AuthRequest.Register("Jane", "jane@sabores.com", "password123");
        given(userRepository.existsByEmail("jane@sabores.com")).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("hashed");
        given(userRepository.save(any(User.class))).willReturn(savedUser);
        given(jwtService.generateToken(any(User.class))).willReturn("jwt-token");

        AuthResponse response = authService.register(req);

        assertThat(response).isNotNull();
        assertThat(response.token()).isNotNull().isNotEmpty();
    }

    // -----------------------------------------------------------------------
    // login()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("login() returns AuthResponse with a non-null token on valid credentials")
    void login_returnsAuthResponseWithTokenOnValidCredentials() {
        AuthRequest.Login req = new AuthRequest.Login("jane@sabores.com", "password123");
        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willReturn(null); // authenticate succeeds (no exception)
        given(userRepository.findByEmail("jane@sabores.com")).willReturn(Optional.of(savedUser));
        given(jwtService.generateToken(any(User.class))).willReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response).isNotNull();
        assertThat(response.token()).isNotNull().isNotEmpty();
    }
}
