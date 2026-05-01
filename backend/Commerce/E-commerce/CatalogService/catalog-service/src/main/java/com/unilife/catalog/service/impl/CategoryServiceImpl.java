package com.unilife.catalog.service.impl;

import com.unilife.catalog.dto.request.CreateCategoryRequest;
import com.unilife.catalog.dto.response.ApiResponse;
import com.unilife.catalog.dto.response.CategoryResponse;
import com.unilife.catalog.exception.CategoryNotFoundException;
import com.unilife.catalog.mapper.CatalogMapper;
import com.unilife.catalog.model.Category;
import com.unilife.catalog.repository.CategoryRepository;
import com.unilife.catalog.service.ICategoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryServiceImpl implements ICategoryService {

    private final CategoryRepository categoryRepository;
    private final CatalogMapper catalogMapper;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CatalogMapper catalogMapper) {
        this.categoryRepository = categoryRepository;
        this.catalogMapper = catalogMapper;
    }

    @Override
    public ApiResponse<CategoryResponse> createCategory(CreateCategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setParentId(request.getParentId());
        category.setIconUrl(request.getIconUrl());
        category.setDescription(request.getDescription());
        category.setCreatedAt(LocalDateTime.now());
        category = categoryRepository.save(category);
        return ApiResponse.success("Categorie creee", catalogMapper.toCategoryResponse(category));
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.success("Categories", catalogMapper.toCategoryResponseList(categoryRepository.findAll()));
    }

    @Override
    public ApiResponse<CategoryResponse> getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        return ApiResponse.success("Categorie trouvee", catalogMapper.toCategoryResponse(category));
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getRootCategories() {
        return ApiResponse.success("Categories racines",
                catalogMapper.toCategoryResponseList(categoryRepository.findByParentIdIsNull()));
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getSubCategories(String parentId) {
        return ApiResponse.success("Sous-categories",
                catalogMapper.toCategoryResponseList(categoryRepository.findByParentId(parentId)));
    }
    @Override
    public ApiResponse<Void> deleteCategory(String id) {
        categoryRepository.deleteById(id);
        return ApiResponse.success("Catégorie supprimée", null);
    }

    @Override
    public ApiResponse<CategoryResponse> updateCategory(String id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        category.setName(request.getName());
        categoryRepository.save(category);
        return ApiResponse.success("Catégorie mise à jour", catalogMapper.toCategoryResponse(category));
    }
}
