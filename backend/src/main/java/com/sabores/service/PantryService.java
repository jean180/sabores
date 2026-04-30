package com.sabores.service;

import com.sabores.dto.request.PantryRequest;
import com.sabores.dto.response.Responses.*;
import com.sabores.entity.*;
import com.sabores.exception.ResourceNotFoundException;
import com.sabores.mapper.RecipeMapper;
import com.sabores.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PantryService {

    // Factores de conversión a unidad base (peso → g, volumen → ml)
    private static final Map<String, BigDecimal> UNIT_TO_BASE = Map.ofEntries(
        Map.entry("g",            BigDecimal.ONE),
        Map.entry("kg",           new BigDecimal("1000")),
        Map.entry("ml",           BigDecimal.ONE),
        Map.entry("l",            new BigDecimal("1000")),
        Map.entry("cucharadas",   new BigDecimal("15")),
        Map.entry("cucharaditas", new BigDecimal("5")),
        Map.entry("tazas",        new BigDecimal("240"))
    );
    private static final Map<String, String> UNIT_GROUP = Map.ofEntries(
        Map.entry("g",            "weight"),
        Map.entry("kg",           "weight"),
        Map.entry("ml",           "volume"),
        Map.entry("l",            "volume"),
        Map.entry("cucharadas",   "volume"),
        Map.entry("cucharaditas", "volume"),
        Map.entry("tazas",        "volume")
    );

    private final PantryRepository pantryRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final RecipeMapper recipeMapper;

    public PantryWithSuggestionsResponse getPantryWithSuggestions(Long userId) {
        List<Pantry> items = pantryRepository.findByUserId(userId);
        List<PantryItemResponse> itemResponses = items.stream().map(this::toPantryResponse).toList();

        List<Long> ingredientIds = items.stream().map(p -> p.getIngredient().getId()).toList();
        List<RecipeSuggestionResponse> suggestions = List.of();

        if (!ingredientIds.isEmpty()) {
            List<Recipe> matches = recipeRepository.findRecipesByIngredients(ingredientIds, 1);
            suggestions = matches.stream()
                    .map(r -> toSuggestion(r, ingredientIds, userId))
                    .filter(s -> s.matchPercentage() >= 25.0)
                    .sorted(Comparator.comparingDouble(RecipeSuggestionResponse::matchPercentage).reversed())
                    .toList();
        }

        return new PantryWithSuggestionsResponse(itemResponses, suggestions);
    }

    @Transactional
    public PantryItemResponse upsert(PantryRequest.Upsert req, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Ingredient ingredient = ingredientRepository.findById(req.ingredientId())
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente", req.ingredientId()));

        Pantry pantry = pantryRepository.findByUserIdAndIngredientId(userId, req.ingredientId())
                .orElse(Pantry.builder().user(user).ingredient(ingredient).build());

        boolean isExisting  = pantry.getId() != null;
        boolean bothHaveQty = isExisting && pantry.getQuantity() != null && req.quantity() != null;

        if (bothHaveQty) {
            String existingUnit = pantry.getUnit() != null ? pantry.getUnit().trim().toLowerCase() : "";
            String newUnit      = req.unit()        != null ? req.unit().trim().toLowerCase()       : "";

            if (existingUnit.equalsIgnoreCase(newUnit)) {
                // Misma unidad: suma directa
                pantry.setQuantity(pantry.getQuantity().add(req.quantity()));
            } else if (sameGroup(existingUnit, newUnit)) {
                // Misma familia (g↔kg, ml↔l↔cucharadas…): convertir a base, sumar, volver a unidad existente
                BigDecimal sumBase = toBase(pantry.getQuantity(), existingUnit)
                                     .add(toBase(req.quantity(), newUnit));
                pantry.setQuantity(fromBase(sumBase, existingUnit));
                // Se mantiene la unidad existente
            } else {
                // Unidades incompatibles: reemplazar
                pantry.setQuantity(req.quantity());
                pantry.setUnit(req.unit());
            }
        } else {
            pantry.setQuantity(req.quantity());
            pantry.setUnit(req.unit());
        }

        return toPantryResponse(pantryRepository.save(pantry));
    }

    private boolean sameGroup(String a, String b) {
        String ga = UNIT_GROUP.get(a);
        String gb = UNIT_GROUP.get(b);
        return ga != null && ga.equals(gb);
    }

    private BigDecimal toBase(BigDecimal qty, String unit) {
        BigDecimal factor = UNIT_TO_BASE.get(unit);
        return factor != null ? qty.multiply(factor) : qty;
    }

    private BigDecimal fromBase(BigDecimal baseQty, String unit) {
        BigDecimal factor = UNIT_TO_BASE.get(unit);
        return factor != null ? baseQty.divide(factor, 4, RoundingMode.HALF_UP).stripTrailingZeros() : baseQty;
    }

    @Transactional
    public void remove(Long ingredientId, Long userId) {
        pantryRepository.deleteByUserIdAndIngredientId(userId, ingredientId);
    }

    private PantryItemResponse toPantryResponse(Pantry p) {
        return new PantryItemResponse(p.getId(),
                recipeMapper.toIngredient(p.getIngredient()),
                p.getQuantity(), p.getUnit(), p.getUpdatedAt());
    }

    private RecipeSuggestionResponse toSuggestion(Recipe r, List<Long> pantryIds, Long userId) {
        List<Long> recipeIngIds = r.getRecipeIngredients().stream()
                .map(ri -> ri.getIngredient().getId()).toList();
        long matched = recipeIngIds.stream().filter(pantryIds::contains).count();
        List<String> missing = r.getRecipeIngredients().stream()
                .filter(ri -> !pantryIds.contains(ri.getIngredient().getId()))
                .map(ri -> ri.getIngredient().getName()).toList();
        double pct = recipeIngIds.isEmpty() ? 0 : (double) matched / recipeIngIds.size() * 100;
        boolean isFav = favoriteRepository.existsByUserIdAndRecipeId(userId, r.getId());
        return new RecipeSuggestionResponse(
                recipeMapper.toSummary(r, isFav), recipeIngIds.size(), (int) matched, pct, missing);
    }
}
