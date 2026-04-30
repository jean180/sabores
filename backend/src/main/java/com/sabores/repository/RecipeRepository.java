package com.sabores.repository;

import com.sabores.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Page<Recipe> findByIsPublicTrue(Pageable pageable);

    Page<Recipe> findByUserIdAndIsPublicTrue(Long userId, Pageable pageable);

    Page<Recipe> findByUserId(Long userId, Pageable pageable);

    @Query("""
                SELECT r FROM Recipe r
                WHERE r.isPublic = true
                  AND (:categoryId IS NULL OR r.category.id = :categoryId)
                  AND (:difficulty IS NULL OR r.difficulty = :difficulty)
                  AND (:maxPrepTime IS NULL OR r.prepTime <= :maxPrepTime)
                  AND (:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')))
                  AND (:ingredientCount = 0 OR
                    (SELECT COUNT(DISTINCT ri.ingredient.id) FROM RecipeIngredient ri
                     WHERE ri.recipe = r AND ri.ingredient.id IN :ingredientIds) >= :ingredientCount)
            """)
    Page<Recipe> searchRecipes(
            @Param("categoryId") Long categoryId,
            @Param("difficulty") Recipe.Difficulty difficulty,
            @Param("maxPrepTime") Integer maxPrepTime,
            @Param("search") String search,
            @Param("ingredientIds") List<Long> ingredientIds,
            @Param("ingredientCount") int ingredientCount,
            Pageable pageable
    );

    @Query("""
                SELECT DISTINCT r FROM Recipe r
                JOIN r.recipeIngredients ri
                WHERE r.isPublic = true
                  AND ri.ingredient.id IN :ingredientIds
                GROUP BY r.id
                HAVING COUNT(DISTINCT ri.ingredient.id) >= :minMatch
                ORDER BY COUNT(DISTINCT ri.ingredient.id) DESC
            """)
    List<Recipe> findRecipesByIngredients(
            @Param("ingredientIds") List<Long> ingredientIds,
            @Param("minMatch") long minMatch
    );
}
