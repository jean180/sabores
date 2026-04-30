package com.sabores.controller;

import com.sabores.dto.request.RecipeRequest;
import com.sabores.dto.response.Responses.PageResponse;
import com.sabores.dto.response.Responses.RecipeDetailResponse;
import com.sabores.dto.response.Responses.RecipeSummaryResponse;
import com.sabores.entity.User;
import com.sabores.service.RecipeService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<PageResponse<RecipeSummaryResponse>> search(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer maxPrepTime,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<Long> ingredientIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal User user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(
                recipeService.search(categoryId, difficulty, maxPrepTime, search, ingredientIds, page, size, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDetailResponse> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(recipeService.findById(id, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<RecipeSummaryResponse>> findByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal User user) {
        Long currentId = user != null ? user.getId() : null;
        return ResponseEntity.ok(recipeService.findByUser(userId, page, size, currentId));
    }

    @PostMapping
    public ResponseEntity<RecipeDetailResponse> create(
            @Valid @RequestBody RecipeRequest.Create req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recipeService.create(req, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipeDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequest.Update req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recipeService.update(id, req, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        recipeService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
