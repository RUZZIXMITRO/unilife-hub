package com.unilife.inventory.controller;

import com.unilife.inventory.dto.request.AddStockRequest;
import com.unilife.inventory.dto.request.CreateInventoryRequest;
import com.unilife.inventory.dto.request.ReserveStockRequest;
import com.unilife.inventory.dto.response.ApiResponse;
import com.unilife.inventory.dto.response.InventoryResponse;
import com.unilife.inventory.dto.response.StockMovementResponse;
import com.unilife.inventory.service.IInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Gestion du stock des produits")
public class InventoryController {

    private final IInventoryService inventoryService;

    public InventoryController(IInventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    @Operation(summary = "Creer un stock pour un produit")
    public ResponseEntity<ApiResponse<InventoryResponse>> createInventory(
            @Valid @RequestBody CreateInventoryRequest request) {
        ApiResponse<InventoryResponse> response = inventoryService.createInventory(request);
        HttpStatus status = response.isSuccess() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Recuperer le stock d un produit")
    public ResponseEntity<ApiResponse<InventoryResponse>> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @GetMapping
    @Operation(summary = "Recuperer tous les stocks")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Produits en stock faible")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PostMapping("/product/{productId}/add")
    @Operation(summary = "Ajouter du stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> addStock(
            @PathVariable Long productId, @Valid @RequestBody AddStockRequest request) {
        return ResponseEntity.ok(inventoryService.addStock(productId, request));
    }

    @PostMapping("/product/{productId}/remove")
    @Operation(summary = "Retirer du stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> removeStock(
            @PathVariable Long productId, @Valid @RequestBody AddStockRequest request) {
        return ResponseEntity.ok(inventoryService.removeStock(productId, request));
    }

    @PostMapping("/product/{productId}/reserve")
    @Operation(summary = "Reserver du stock - appele par OrderService")
    public ResponseEntity<ApiResponse<InventoryResponse>> reserveStock(
            @PathVariable Long productId, @Valid @RequestBody ReserveStockRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(productId, request));
    }

    @PostMapping("/product/{productId}/release/{orderId}")
    @Operation(summary = "Liberer le stock reserve")
    public ResponseEntity<ApiResponse<InventoryResponse>> releaseStock(
            @PathVariable Long productId, @PathVariable Long orderId) {
        return ResponseEntity.ok(inventoryService.releaseStock(productId, orderId));
    }

    @GetMapping("/product/{productId}/movements")
    @Operation(summary = "Historique des mouvements")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getMovements(
            @PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getMovementsByProductId(productId));
    }

    @GetMapping("/product/{productId}/available")
    @Operation(summary = "Verifier disponibilite")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @PathVariable Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.isAvailable(productId, quantity));
    }
}
