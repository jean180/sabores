package com.sabores.service;

import com.sabores.dto.request.MealPlanRequest;
import com.sabores.dto.response.Responses.MealPlanResponse;
import com.sabores.dto.response.Responses.RecipeSummaryResponse;
import com.sabores.dto.response.Responses.WeeklyPlanResponse;
import com.sabores.entity.MealPlan;
import com.sabores.entity.Recipe;
import com.sabores.entity.User;
import com.sabores.exception.ResourceNotFoundException;
import com.sabores.mapper.RecipeMapper;
import com.sabores.repository.FavoriteRepository;
import com.sabores.repository.MealPlanRepository;
import com.sabores.repository.RecipeRepository;
import com.sabores.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final RecipeMapper recipeMapper;

    public WeeklyPlanResponse getWeek(Long userId, LocalDate from) {
        LocalDate to = from.plusDays(6);
        List<MealPlan> meals = mealPlanRepository
                .findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(userId, from, to);
        return new WeeklyPlanResponse(meals.stream().map(m -> toResponse(m, userId)).toList());
    }

    @Transactional
    public MealPlanResponse upsert(MealPlanRequest.Upsert req, Long userId) {
        mealPlanRepository.deleteByUserIdAndPlanDateAndMealType(userId, req.planDate(), req.mealType());
        User user = userRepository.findById(userId).orElseThrow();
        Recipe recipe = recipeRepository.findById(req.recipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Receta", req.recipeId()));
        MealPlan plan = MealPlan.builder()
                .user(user).recipe(recipe)
                .planDate(req.planDate()).mealType(req.mealType())
                .build();
        return toResponse(mealPlanRepository.save(plan), userId);
    }

    @Transactional
    public void remove(LocalDate date, MealPlan.MealType mealType, Long userId) {
        mealPlanRepository.deleteByUserIdAndPlanDateAndMealType(userId, date, mealType);
    }

    private MealPlanResponse toResponse(MealPlan m, Long userId) {
        boolean isFav = favoriteRepository.existsByUserIdAndRecipeId(userId, m.getRecipe().getId());
        RecipeSummaryResponse summary = recipeMapper.toSummary(m.getRecipe(), isFav);
        return new MealPlanResponse(m.getId(), m.getPlanDate(), m.getMealType(), summary);
    }
}
