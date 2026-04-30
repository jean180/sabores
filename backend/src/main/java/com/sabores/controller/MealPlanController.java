package com.sabores.controller;

import com.sabores.dto.request.MealPlanRequest;
import com.sabores.dto.response.Responses.MealPlanResponse;
import com.sabores.dto.response.Responses.WeeklyPlanResponse;
import com.sabores.entity.MealPlan;
import com.sabores.entity.User;
import com.sabores.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/meal-plan")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping("/week")
    public ResponseEntity<WeeklyPlanResponse> getWeek(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mealPlanService.getWeek(user.getId(), from));
    }

    @PostMapping
    public ResponseEntity<MealPlanResponse> upsert(
            @Valid @RequestBody MealPlanRequest.Upsert req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mealPlanService.upsert(req, user.getId()));
    }

    @DeleteMapping
    public ResponseEntity<Void> remove(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam MealPlan.MealType mealType,
            @AuthenticationPrincipal User user) {
        mealPlanService.remove(date, mealType, user.getId());
        return ResponseEntity.noContent().build();
    }
}
