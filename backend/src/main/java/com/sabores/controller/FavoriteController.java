package com.sabores.controller;

import com.sabores.dto.response.Responses.PageResponse;
import com.sabores.dto.response.Responses.RecipeSummaryResponse;
import com.sabores.entity.User;
import com.sabores.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<PageResponse<RecipeSummaryResponse>> getFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.getFavorites(user.getId(), page, size));
    }

    @PostMapping("/{recipeId}/toggle")
    public ResponseEntity<Void> toggle(
            @PathVariable Long recipeId,
            @AuthenticationPrincipal User user) {
        favoriteService.toggle(recipeId, user.getId());
        return ResponseEntity.ok().build();
    }
}
