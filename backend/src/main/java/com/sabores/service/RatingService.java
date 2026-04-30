package com.sabores.service;

import com.sabores.dto.response.Responses.RatingResponse;
import com.sabores.entity.Rating;
import com.sabores.entity.Recipe;
import com.sabores.entity.User;
import com.sabores.exception.ResourceNotFoundException;
import com.sabores.repository.RatingRepository;
import com.sabores.repository.RecipeRepository;
import com.sabores.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    public List<RatingResponse> getByRecipe(Long recipeId) {
        return ratingRepository.findByRecipeIdOrderByCreatedAtDesc(recipeId)
                .stream().map(this::toResponse).toList();
    }

    public Optional<RatingResponse> getUserRating(Long recipeId, Long userId) {
        return ratingRepository.findByUserIdAndRecipeId(userId, recipeId).map(this::toResponse);
    }

    @Transactional
    public RatingResponse upsert(Long recipeId, Long userId, int score, String comment) {
        Rating rating = ratingRepository.findByUserIdAndRecipeId(userId, recipeId)
                .orElseGet(() -> {
                    Recipe recipe = recipeRepository.findById(recipeId)
                            .orElseThrow(() -> new ResourceNotFoundException("Receta", recipeId));
                    User user = userRepository.findById(userId).orElseThrow();
                    return Rating.builder().recipe(recipe).user(user).build();
                });
        rating.setScore(score);
        rating.setComment(comment);
        return toResponse(ratingRepository.save(rating));
    }

    @Transactional
    public void delete(Long recipeId, Long userId) {
        ratingRepository.deleteByUserIdAndRecipeId(userId, recipeId);
    }

    private RatingResponse toResponse(Rating r) {
        return new RatingResponse(r.getId(), r.getUser().getName(),
                r.getScore(), r.getComment(), r.getCreatedAt());
    }
}
