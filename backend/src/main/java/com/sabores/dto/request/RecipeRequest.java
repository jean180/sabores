package com.sabores.dto.request;

import com.sabores.entity.Recipe;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class RecipeRequest {

    public record Create(
        @NotBlank @Size(max = 200) String title,
        String description,
        String imageUrl,
        @NotNull @Min(1) Integer prepTime,
        @NotNull @Min(1) Integer servings,
        Recipe.Difficulty difficulty,
        Boolean isPublic,
        Long categoryId,
        @NotEmpty @Valid List<IngredientItem> ingredients,
        @NotEmpty List<StepItem> steps
    ) {}

    public record Update(
        @Size(max = 200) String title,
        String description,
        String imageUrl,
        @Min(1) Integer prepTime,
        @Min(1) Integer servings,
        Recipe.Difficulty difficulty,
        Boolean isPublic,
        Long categoryId,
        @Valid List<IngredientItem> ingredients,
        List<StepItem> steps
    ) {}

    public record IngredientItem(
        @NotNull Long ingredientId,
        String ingredientName,
        @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal quantity,
        @NotBlank String unit
    ) {}

    public record StepItem(
        @NotNull @Min(1) Integer stepNumber,
        @NotBlank String description
    ) {}
}
