package com.unilife.inventory.service;

import com.unilife.inventory.dto.request.AddStockRequest;
import com.unilife.inventory.dto.request.CreateInventoryRequest;
import com.unilife.inventory.dto.request.ReserveStockRequest;
import com.unilife.inventory.dto.response.ApiResponse;
import com.unilife.inventory.dto.response.InventoryResponse;
import com.unilife.inventory.dto.response.StockMovementResponse;

import java.util.List;

/**
 * Interface du service d'inventaire.
 *
 * SOLID - I : Interface Segregation — cette interface ne contient que
 *             les méthodes liées à l'inventaire, pas aux mouvements ni aux réservations.
 * SOLID - D : Dependency Inversion — le controller dépend de cette interface,
 *             jamais de l'implémentation concrète.
 * SOLID - O : Open/Closed — on peut créer une nouvelle implémentation
 *             sans toucher au controller.
 */
public interface IInventoryService {

    // ── CRUD stock ──────────────────────────────────────────
    ApiResponse<InventoryResponse> createInventory(CreateInventoryRequest request);

    ApiResponse<InventoryResponse> getInventoryByProductId(Long productId);

    ApiResponse<List<InventoryResponse>> getAllInventories();

    ApiResponse<List<InventoryResponse>> getLowStockItems();

    // ── Opérations stock ────────────────────────────────────
    ApiResponse<InventoryResponse> addStock(Long productId, AddStockRequest request);

    ApiResponse<InventoryResponse> removeStock(Long productId, AddStockRequest request);

    // ── Réservations (appelées par OrderService) ────────────
    ApiResponse<InventoryResponse> reserveStock(Long productId, ReserveStockRequest request);

    ApiResponse<InventoryResponse> releaseStock(Long productId, Long orderId);

    // ── Historique ──────────────────────────────────────────
    ApiResponse<List<StockMovementResponse>> getMovementsByProductId(Long productId);

    // ── Vérification disponibilité ──────────────────────────
    ApiResponse<Boolean> isAvailable(Long productId, Integer quantity);
}
