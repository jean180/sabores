package com.sabores.mapper;

import com.sabores.dto.response.Responses.*;
import com.sabores.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecipeMapper {

    public RecipeSummaryResponse toSummary(Recipe r, boolean isFav) {
        return new RecipeSummaryResponse(
                r.getId(), r.getTitle(), r.getDescription(), r.getImageUrl(),
                r.getPrepTime(), r.getServings(), r.getDifficulty().name(), r.getIsPublic(),
                toCategory(r.getCategory()), r.getUser().getName(), r.getCreatedAt(), isFav,
                r.getAvgRating() != null ? r.getAvgRating() : 0.0,
                r.getRatingCount() != null ? r.getRatingCount() : 0
        );
    }

    public RecipeDetailResponse toDetail(Recipe r, boolean isFav) {
        UserResponse author = new UserResponse(
                r.getUser().getId(), r.getUser().getName(),
                r.getUser().getEmail(), r.getUser().getRole().name());
        List<RecipeIngredientResponse> ings = r.getRecipeIngredients().stream()
                .map(ri -> new RecipeIngredientResponse(
                        ri.getId(), toIngredient(ri.getIngredient()),
                        ri.getQuantity(), ri.getUnit()))
                .toList();
        List<RecipeStepResponse> steps = r.getSteps().stream()
                .map(s -> new RecipeStepResponse(s.getId(), s.getStepNumber(), s.getDescription()))
                .toList();
        return new RecipeDetailResponse(
                r.getId(), r.getTitle(), r.getDescription(), r.getImageUrl(),
                r.getPrepTime(), r.getServings(), r.getDifficulty().name(), r.getIsPublic(),
                toCategory(r.getCategory()), author, r.getCreatedAt(), ings, steps, isFav,
                r.getAvgRating() != null ? r.getAvgRating() : 0.0,
                r.getRatingCount() != null ? r.getRatingCount() : 0
        );
    }

    public CategoryResponse toCategory(Category c) {
        return c != null ? new CategoryResponse(c.getId(), c.getName(), c.getIcon()) : null;
    }

    public IngredientResponse toIngredient(Ingredient i) {
        return new IngredientResponse(i.getId(), i.getName(), i.getCategory());
    }
}
