package com.unilife.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateInventoryRequest {

    @NotNull(message = "L'ID du produit est obligatoire")
    private Long productId;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer quantityAvailable;

    @Min(value = 0, message = "Le seuil d'alerte ne peut pas être négatif")
    private Integer alertThreshold;

    public CreateInventoryRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(Integer quantityAvailable) { this.quantityAvailable = quantityAvailable; }
    public Integer getAlertThreshold() { return alertThreshold; }
    public void setAlertThreshold(Integer alertThreshold) { this.alertThreshold = alertThreshold; }
}
