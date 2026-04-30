package com.sabores.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    public record Register(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password
    ) {}

    public record Login(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}
}
