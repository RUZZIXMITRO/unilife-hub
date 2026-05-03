package com.unilife.catalog.controller;

import com.unilife.catalog.dto.request.CreateProductRequest;
import com.unilife.catalog.dto.response.ApiResponse;
import com.unilife.catalog.dto.response.ProductResponse;
import com.unilife.catalog.service.IProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour les produits.
 * SOLID - S : recoit les requetes HTTP et delegue au service.
 * SOLID - D : depend de IProductService (interface).
 */
@RestController
@RequestMapping("/api/catalog/products")
@Tag(name = "Products", description = "Gestion du catalogue produits")
public class ProductController {

    private final IProductService productService;

    public ProductController(IProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @Operation(summary = "Creer un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ApiResponse<ProductResponse> response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Recuperer un produit par ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping
    @Operation(summary = "Lister tous les produits actifs")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Produits par categorie")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getByCategory(
            @PathVariable String categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher des produits")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/seller/{sellerId}")
    @Operation(summary = "Produits d un vendeur")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getBySeller(
            @PathVariable Long sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Mettre a jour un produit")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable String id,
            @Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactiver un produit")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @GetMapping("/{productId}/available")
    @Operation(summary = "Verifier disponibilite stock")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @PathVariable String productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(productService.isAvailable(productId, quantity));
    }
}
