package com.unilife.catalog.mapper;

import com.unilife.catalog.dto.response.CategoryResponse;
import com.unilife.catalog.dto.response.ProductResponse;
import com.unilife.catalog.model.Category;
import com.unilife.catalog.model.Product;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper manuel Entity <-> DTO.
 * SOLID - S : responsabilite unique = transformer les objets.
 */
@Component
public class CatalogMapper {

    public ProductResponse toProductResponse(Product product) {
        if (product == null) return null;
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setTitle(product.getTitle());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategoryId(product.getCategoryId());
        response.setCondition(product.getCondition());
        response.setSellerId(product.getSellerId());
        response.setImages(product.getImages());
        response.setAttributes(product.getAttributes());
        response.setActive(product.isActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    public List<ProductResponse> toProductResponseList(List<Product> products) {
        return products.stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setParentId(category.getParentId());
        response.setIconUrl(category.getIconUrl());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }

    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        return categories.stream().map(this::toCategoryResponse).collect(Collectors.toList());
    }
}
