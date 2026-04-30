package com.sabores.controller;

import com.sabores.dto.request.PantryRequest;
import com.sabores.dto.response.Responses.PantryItemResponse;
import com.sabores.dto.response.Responses.PantryWithSuggestionsResponse;
import com.sabores.entity.User;
import com.sabores.service.PantryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pantry")
@RequiredArgsConstructor
public class PantryController {

    private final PantryService pantryService;

    @GetMapping
    public ResponseEntity<PantryWithSuggestionsResponse> getPantry(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(pantryService.getPantryWithSuggestions(user.getId()));
    }

    @PostMapping
    public ResponseEntity<PantryItemResponse> upsert(
            @Valid @RequestBody PantryRequest.Upsert req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(pantryService.upsert(req, user.getId()));
    }

    @DeleteMapping("/{ingredientId}")
    public ResponseEntity<Void> remove(
            @PathVariable Long ingredientId,
            @AuthenticationPrincipal User user) {
        pantryService.remove(ingredientId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
