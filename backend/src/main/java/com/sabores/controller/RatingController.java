package com.sabores.controller;

import com.sabores.dto.request.RatingRequest;
import com.sabores.dto.response.Responses.RatingResponse;
import com.sabores.entity.User;
import com.sabores.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recipes/{recipeId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping
    public ResponseEntity<List<RatingResponse>> getByRecipe(@PathVariable Long recipeId) {
        return ResponseEntity.ok(ratingService.getByRecipe(recipeId));
    }

    @GetMapping("/me")
    public ResponseEntity<RatingResponse> getMyRating(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal User user) {
        return ratingService.getUserRating(recipeId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<RatingResponse> upsert(
            @PathVariable Long recipeId,
            @RequestBody RatingRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ratingService.upsert(recipeId, user.getId(), req.score(), req.comment()));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> delete(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal User user) {
        ratingService.delete(recipeId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
