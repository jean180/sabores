package com.sabores.dto.response;

import com.sabores.entity.MealPlan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Responses {

    public record AuthResponse(String token, UserResponse user) {
    }

    public record UserResponse(Long id, String name, String email, String role) {
    }

    public record CategoryResponse(Long id, String name, String icon) {
    }

    public record IngredientResponse(Long id, String name, String category) {
    }

    public record RatingResponse(Long id, String userName, int score, String comment, LocalDateTime createdAt) {
    }

    public record RecipeIngredientResponse(
            Long id, IngredientResponse ingredient,
            BigDecimal quantity, String unit
    ) {
    }

    public record RecipeStepResponse(Long id, Integer stepNumber, String description) {
    }

    public record RecipeSummaryResponse(
            Long id, String title, String description, String imageUrl,
            Integer prepTime, Integer servings, String difficulty,
            Boolean isPublic, CategoryResponse category,
            String authorName, LocalDateTime createdAt,
            boolean isFavorite, double avgRating, int ratingCount
    ) {
    }

    public record RecipeDetailResponse(
            Long id, String title, String description, String imageUrl,
            Integer prepTime, Integer servings, String difficulty,
            Boolean isPublic, CategoryResponse category,
            UserResponse author, LocalDateTime createdAt,
            List<RecipeIngredientResponse> ingredients,
            List<RecipeStepResponse> steps,
            boolean isFavorite, double avgRating, int ratingCount
    ) {
    }

    public record PantryItemResponse(
            Long id, IngredientResponse ingredient,
            BigDecimal quantity, String unit, LocalDateTime updatedAt
    ) {
    }

    public record PantryWithSuggestionsResponse(
            List<PantryItemResponse> items,
            List<RecipeSuggestionResponse> suggestions
    ) {
    }

    public record RecipeSuggestionResponse(
            RecipeSummaryResponse recipe,
            int totalIngredients,
            int matchedIngredients,
            double matchPercentage,
            List<String> missingIngredients
    ) {
    }

    public record MealPlanResponse(
            Long id, LocalDate planDate, MealPlan.MealType mealType,
            RecipeSummaryResponse recipe
    ) {
    }

    public record WeeklyPlanResponse(List<MealPlanResponse> meals) {
    }

    public record PageResponse<T>(
            List<T> content, int page, int size,
            long totalElements, int totalPages, boolean last
    ) {
    }

    public record ErrorResponse(int status, String error, String message, LocalDateTime timestamp) {
    }
}
