package com.sabores.controller;

import com.sabores.dto.response.Responses.IngredientResponse;
import com.sabores.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientRepository ingredientRepository;

    @GetMapping
    public ResponseEntity<List<IngredientResponse>> search(
            @RequestParam(required = false) String q) {
        List<IngredientResponse> result = ingredientRepository.findAll().stream()
                .filter(i -> q == null || i.getName().toLowerCase().contains(q.toLowerCase()))
                .map(i -> new IngredientResponse(i.getId(), i.getName(), i.getCategory()))
                .toList();
        return ResponseEntity.ok(result);
    }
}
