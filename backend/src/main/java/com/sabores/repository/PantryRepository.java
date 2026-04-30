package com.sabores.repository;
import com.sabores.entity.Pantry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface PantryRepository extends JpaRepository<Pantry, Long> {
    List<Pantry> findByUserId(Long userId);
    Optional<Pantry> findByUserIdAndIngredientId(Long userId, Long ingredientId);
    void deleteByUserIdAndIngredientId(Long userId, Long ingredientId);
}
