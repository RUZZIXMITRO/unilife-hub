package com.unilife.catalog.service;

import com.unilife.catalog.dto.request.CreateProductRequest;
import com.unilife.catalog.dto.response.ApiResponse;
import com.unilife.catalog.dto.response.ProductResponse;

import java.util.List;

/**
 * Interface du service produits.
 * SOLID - I : interface segregee, ne contient que les methodes produits.
 * SOLID - D : le controller depend de cette interface, jamais de l implementation.
 */
public interface IProductService {
    ApiResponse<ProductResponse> createProduct(CreateProductRequest request);
    ApiResponse<ProductResponse> getProductById(String id);
    ApiResponse<List<ProductResponse>> getAllProducts();
    ApiResponse<List<ProductResponse>> getProductsByCategory(String categoryId);
    ApiResponse<List<ProductResponse>> searchProducts(String keyword);
    ApiResponse<List<ProductResponse>> getProductsBySeller(Long sellerId);
    ApiResponse<ProductResponse> updateProduct(String id, CreateProductRequest request);
    ApiResponse<Void> deleteProduct(String id);
    ApiResponse<Boolean> isAvailable(String productId, Integer quantity);
}
