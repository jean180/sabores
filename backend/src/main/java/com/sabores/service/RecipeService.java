package com.sabores.service;

import com.sabores.dto.request.RecipeRequest;
import com.sabores.dto.response.Responses.*;
import com.sabores.entity.*;
import com.sabores.exception.BusinessException;
import com.sabores.exception.ResourceNotFoundException;
import com.sabores.mapper.RecipeMapper;
import com.sabores.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    private final IngredientRepository ingredientRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final RecipeMapper recipeMapper;

    public PageResponse<RecipeSummaryResponse> search(
            Long categoryId, String difficulty, Integer maxPrepTime, String search,
            List<Long> ingredientIds, int page, int size, Long currentUserId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Recipe.Difficulty diff = difficulty != null ? Recipe.Difficulty.valueOf(difficulty.toUpperCase()) : null;
        List<Long> ingIds = (ingredientIds != null && !ingredientIds.isEmpty()) ? ingredientIds : List.of(-1L);
        int ingCount = (ingredientIds != null) ? ingredientIds.size() : 0;
        Page<Recipe> result = recipeRepository.searchRecipes(categoryId, diff, maxPrepTime, search, ingIds, ingCount, pageable);
        return toPageResponse(result, currentUserId);
    }

    public RecipeDetailResponse findById(Long id, Long currentUserId) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receta", id));
        boolean isFav = currentUserId != null && favoriteRepository.existsByUserIdAndRecipeId(currentUserId, id);
        return recipeMapper.toDetail(recipe, isFav);
    }

    public PageResponse<RecipeSummaryResponse> findByUser(Long userId, int page, int size, Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recipe> result = userId.equals(currentUserId)
                ? recipeRepository.findByUserId(userId, pageable)
                : recipeRepository.findByUserIdAndIsPublicTrue(userId, pageable);
        return toPageResponse(result, currentUserId);
    }

    @Transactional
    public RecipeDetailResponse create(RecipeRequest.Create req, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Category category = req.categoryId() != null
                ? categoryRepository.findById(req.categoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Categoría", req.categoryId()))
                : null;

        Recipe recipe = Recipe.builder()
                .title(req.title()).description(req.description())
                .imageUrl(req.imageUrl()).prepTime(req.prepTime())
                .servings(req.servings() != null ? req.servings() : 4)
                .difficulty(req.difficulty() != null ? req.difficulty() : Recipe.Difficulty.EASY)
                .isPublic(req.isPublic() != null ? req.isPublic() : true)
                .user(user).category(category)
                .build();

        addIngredients(recipe, req.ingredients());
        addSteps(recipe, req.steps());
        recipeRepository.save(recipe);
        return recipeMapper.toDetail(recipe, false);
    }

    @Transactional
    public RecipeDetailResponse update(Long id, RecipeRequest.Update req, Long userId) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receta", id));
        if (!recipe.getUser().getId().equals(userId))
            throw new BusinessException("No tienes permiso para editar esta receta");

        if (req.title() != null)       recipe.setTitle(req.title());
        if (req.description() != null) recipe.setDescription(req.description());
        if (req.imageUrl() != null)    recipe.setImageUrl(req.imageUrl());
        if (req.prepTime() != null)    recipe.setPrepTime(req.prepTime());
        if (req.servings() != null)    recipe.setServings(req.servings());
        if (req.difficulty() != null)  recipe.setDifficulty(req.difficulty());
        if (req.isPublic() != null)    recipe.setIsPublic(req.isPublic());
        if (req.categoryId() != null) {
            recipe.setCategory(categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría", req.categoryId())));
        }
        if (req.ingredients() != null) {
            recipe.getRecipeIngredients().clear();
            recipeRepository.saveAndFlush(recipe);
            addIngredients(recipe, req.ingredients());
        }
        if (req.steps() != null) {
            recipe.getSteps().clear();
            recipeRepository.saveAndFlush(recipe);
            addSteps(recipe, req.steps());
        }
        return recipeMapper.toDetail(recipe, favoriteRepository.existsByUserIdAndRecipeId(userId, id));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receta", id));
        if (!recipe.getUser().getId().equals(userId))
            throw new BusinessException("No tienes permiso para eliminar esta receta");
        recipeRepository.delete(recipe);
    }

    private void addIngredients(Recipe recipe, List<RecipeRequest.IngredientItem> items) {
        items.forEach(item -> {
            Ingredient ingredient = item.ingredientId() != null
                    ? ingredientRepository.findById(item.ingredientId()).orElseThrow()
                    : ingredientRepository.findByNameIgnoreCase(item.ingredientName())
                            .orElseGet(() -> ingredientRepository.save(
                                    Ingredient.builder().name(item.ingredientName()).build()));
            recipe.getRecipeIngredients().add(RecipeIngredient.builder()
                    .recipe(recipe).ingredient(ingredient)
                    .quantity(item.quantity()).unit(item.unit()).build());
        });
    }

    private void addSteps(Recipe recipe, List<RecipeRequest.StepItem> steps) {
        steps.forEach(s -> recipe.getSteps().add(RecipeStep.builder()
                .recipe(recipe).stepNumber(s.stepNumber()).description(s.description()).build()));
    }

    private PageResponse<RecipeSummaryResponse> toPageResponse(Page<Recipe> page, Long userId) {
        List<RecipeSummaryResponse> content = page.getContent().stream()
                .map(r -> recipeMapper.toSummary(r,
                        userId != null && favoriteRepository.existsByUserIdAndRecipeId(userId, r.getId())))
                .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
