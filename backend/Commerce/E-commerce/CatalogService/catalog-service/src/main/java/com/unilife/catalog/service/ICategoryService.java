package com.unilife.catalog.service;

import com.unilife.catalog.dto.request.CreateCategoryRequest;
import com.unilife.catalog.dto.response.ApiResponse;
import com.unilife.catalog.dto.response.CategoryResponse;

import java.util.List;

public interface ICategoryService {
    ApiResponse<CategoryResponse> createCategory(CreateCategoryRequest request);
    ApiResponse<List<CategoryResponse>> getAllCategories();
    ApiResponse<CategoryResponse> getCategoryById(String id);
    ApiResponse<List<CategoryResponse>> getRootCategories();
    ApiResponse<List<CategoryResponse>> getSubCategories(String parentId);
    ApiResponse<Void> deleteCategory(String id);
    ApiResponse<CategoryResponse> updateCategory(String id, CreateCategoryRequest request);
}
