package com.unilife.inventory.dto.response;

import com.unilife.inventory.model.StockMovement.MovementType;
import java.time.LocalDateTime;

public class StockMovementResponse {
    private Long id;
    private Long productId;
    private MovementType type;
    private Integer quantity;
    private String reason;
    private Long createdBy;
    private LocalDateTime createdAt;

    public StockMovementResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
