package com.unilife.inventory.mapper;

import com.unilife.inventory.dto.response.InventoryResponse;
import com.unilife.inventory.dto.response.StockMovementResponse;
import com.unilife.inventory.model.Inventory;
import com.unilife.inventory.model.StockMovement;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryMapper {

    public InventoryResponse toResponse(Inventory inventory) {
        if (inventory == null) return null;
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setProductId(inventory.getProductId());
        response.setQuantityAvailable(inventory.getQuantityAvailable());
        response.setQuantityReserved(inventory.getQuantityReserved());
        response.setAlertThreshold(inventory.getAlertThreshold());
        response.setIsLowStock(inventory.getQuantityAvailable() <= inventory.getAlertThreshold());
        response.setCreatedAt(inventory.getCreatedAt());
        response.setUpdatedAt(inventory.getUpdatedAt());
        return response;
    }

    public List<InventoryResponse> toResponseList(List<Inventory> inventories) {
        return inventories.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public StockMovementResponse toMovementResponse(StockMovement movement) {
        if (movement == null) return null;
        StockMovementResponse response = new StockMovementResponse();
        response.setId(movement.getId());
        response.setProductId(movement.getProductId());
        response.setType(movement.getType());
        response.setQuantity(movement.getQuantity());
        response.setReason(movement.getReason());
        response.setCreatedBy(movement.getCreatedBy());
        response.setCreatedAt(movement.getCreatedAt());
        return response;
    }

    public List<StockMovementResponse> toMovementResponseList(List<StockMovement> movements) {
        return movements.stream().map(this::toMovementResponse).collect(Collectors.toList());
    }
}
