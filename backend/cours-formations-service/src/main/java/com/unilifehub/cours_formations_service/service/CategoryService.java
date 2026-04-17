package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.dto.request.CategoryRequest;
import com.unilifehub.cours_formations_service.dto.response.CategoryResponse;
import com.unilifehub.cours_formations_service.entity.Category;
import com.unilifehub.cours_formations_service.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByParentCategoryIsNull()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        return toResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .color(request.getColor())
                .coursesCount(0)
                .formationsCount(0)
                .build();

        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));
            category.setParentCategory(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));
            category.setParentCategory(parent);
        }

        return toResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Integer id) {
        categoryRepository.deleteById(id);
    }

    public CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .color(category.getColor())
                .coursesCount(category.getCoursesCount())
                .formationsCount(category.getFormationsCount())
                .parentCategoryId(category.getParentCategory() != null
                        ? category.getParentCategory().getId() : null)
                .parentCategoryName(category.getParentCategory() != null
                        ? category.getParentCategory().getName() : null)
                .subCategories(category.getSubCategories() != null
                        ? category.getSubCategories().stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()) : null)
                .build();
    }
}