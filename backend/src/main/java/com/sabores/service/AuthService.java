package com.sabores.service;

import com.sabores.dto.request.AuthRequest;
import com.sabores.dto.response.Responses.*;
import com.sabores.entity.User;
import com.sabores.exception.BusinessException;
import com.sabores.repository.UserRepository;
import com.sabores.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException("El email ya está registrado");
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toUserResponse(user));
    }

    public AuthResponse login(AuthRequest.Login req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toUserResponse(user));
    }

    private UserResponse toUserResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
}
