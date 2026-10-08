package com.unilife.favorite.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AddFavoriteRequest {

    @NotBlank(message = "L ID du produit est obligatoire")
    private String productId;

    public AddFavoriteRequest() {}
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
}