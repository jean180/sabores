package com.sabores.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class PantryRequest {
    public record Upsert(
            @NotNull Long ingredientId,
            @DecimalMin(value = "0.0", inclusive = true)
            @Digits(integer = 8, fraction = 2)
            BigDecimal quantity,
            String unit
    ) {
    }
}
