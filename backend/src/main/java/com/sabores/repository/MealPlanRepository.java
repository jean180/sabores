package com.sabores.repository;

import com.sabores.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    List<MealPlan> findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(Long userId, LocalDate from, LocalDate to);

    Optional<MealPlan> findByUserIdAndPlanDateAndMealType(Long userId, LocalDate date, MealPlan.MealType mealType);

    void deleteByUserIdAndPlanDateAndMealType(Long userId, LocalDate date, MealPlan.MealType mealType);
}
