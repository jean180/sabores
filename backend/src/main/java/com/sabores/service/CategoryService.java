package com.sabores.service;

import com.sabores.dto.response.Responses.CategoryResponse;
import com.sabores.mapper.RecipeMapper;
import com.sabores.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final RecipeMapper recipeMapper;

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(recipeMapper::toCategory)
                .toList();
    }
}
