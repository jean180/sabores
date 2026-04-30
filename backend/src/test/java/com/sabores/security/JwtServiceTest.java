package com.sabores.security;

import com.sabores.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    // A 256-bit (32-byte) Base64-encoded secret — same as the one in application.yml
    private static final String SECRET =
            "c2FiMDByM3NfajB0X3MzY3IzdF9rM3lfZjByX2Rldl9vbmx5X2RvX25vdF91c2VfaW5fcHJvZA==";
    private static final long EXPIRATION_MS = 86_400_000L; // 24 h

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationMs", EXPIRATION_MS);

        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@sabores.com")
                .password("encoded-password")
                .role(User.Role.USER)
                .build();
    }

    @Test
    @DisplayName("generateToken() returns a non-null, non-empty string")
    void generateToken_returnsNonNullNonEmpty() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("isTokenValid() returns true for a freshly generated token")
    void isTokenValid_returnsTrueForFreshToken() {
        String token = jwtService.generateToken(testUser);

        assertThat(jwtService.isTokenValid(token, testUser)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid() returns false for a tampered token")
    void isTokenValid_returnsFalseForTamperedToken() {
        String token = jwtService.generateToken(testUser);

        // Tamper: flip the last character of the signature segment
        String tampered = token.substring(0, token.length() - 1) + "X";

        // The JJWT parser throws on signature mismatch; treat that as invalid
        try {
            boolean valid = jwtService.isTokenValid(tampered, testUser);
            assertThat(valid).isFalse();
        } catch (Exception e) {
            // An exception on parse is also acceptable proof that the token is not valid
            assertThat(e).isNotNull();
        }
    }

    @Test
    @DisplayName("extractUsername() returns the correct email")
    void extractUsername_returnsCorrectEmail() {
        String token = jwtService.generateToken(testUser);

        String username = jwtService.extractUsername(token);

        assertThat(username).isEqualTo(testUser.getEmail());
    }
}
