package com.sabores.service;

import com.sabores.dto.response.Responses.PageResponse;
import com.sabores.dto.response.Responses.RecipeSummaryResponse;
import com.sabores.entity.Favorite;
import com.sabores.entity.Recipe;
import com.sabores.entity.User;
import com.sabores.exception.ResourceNotFoundException;
import com.sabores.mapper.RecipeMapper;
import com.sabores.repository.FavoriteRepository;
import com.sabores.repository.RecipeRepository;
import com.sabores.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeMapper recipeMapper;

    public PageResponse<RecipeSummaryResponse> getFavorites(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Favorite> favPage = favoriteRepository.findByUserId(userId, pageable);
        List<RecipeSummaryResponse> content = favPage.getContent().stream()
                .map(f -> recipeMapper.toSummary(f.getRecipe(), true))
                .toList();
        return new PageResponse<>(content, favPage.getNumber(), favPage.getSize(),
                favPage.getTotalElements(), favPage.getTotalPages(), favPage.isLast());
    }

    @Transactional
    public void toggle(Long recipeId, Long userId) {
        if (favoriteRepository.existsByUserIdAndRecipeId(userId, recipeId)) {
            favoriteRepository.deleteByUserIdAndRecipeId(userId, recipeId);
        } else {
            Recipe recipe = recipeRepository.findById(recipeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receta", recipeId));
            User user = userRepository.findById(userId).orElseThrow();
            favoriteRepository.save(Favorite.builder().user(user).recipe(recipe).build());
        }
    }
}
