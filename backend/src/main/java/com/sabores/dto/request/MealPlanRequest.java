package com.sabores.dto.request;

import com.sabores.entity.MealPlan;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MealPlanRequest {
    public record Upsert(
        @NotNull LocalDate planDate,
        @NotNull MealPlan.MealType mealType,
        @NotNull Long recipeId
    ) {}
}
