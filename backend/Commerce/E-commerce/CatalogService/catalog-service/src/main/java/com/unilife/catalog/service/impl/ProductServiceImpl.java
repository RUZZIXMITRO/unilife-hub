package com.unilife.catalog.service.impl;

import com.unilife.catalog.dto.request.CreateProductRequest;
import com.unilife.catalog.dto.response.ApiResponse;
import com.unilife.catalog.dto.response.ProductResponse;
import com.unilife.catalog.exception.ProductNotFoundException;
import com.unilife.catalog.mapper.CatalogMapper;
import com.unilife.catalog.model.Product;
import com.unilife.catalog.model.ProductImage;
import com.unilife.catalog.repository.CategoryRepository;
import com.unilife.catalog.repository.ProductRepository;
import com.unilife.catalog.service.IProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ProductServiceImpl implements IProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CatalogMapper catalogMapper;
    private final WebClient webClient;

    @Value("${services.inventory.url}")
    private String inventoryServiceUrl;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              CatalogMapper catalogMapper,
                              WebClient.Builder webClientBuilder) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.catalogMapper = catalogMapper;
        this.webClient = webClientBuilder.build();
    }

    @Override
    public ApiResponse<ProductResponse> createProduct(CreateProductRequest request) {
        log.info("Creation du produit : {}", request.getTitle());

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategoryId(request.getCategoryId());
        product.setCondition(request.getCondition());
        product.setSellerId(request.getSellerId());
        product.setAttributes(request.getAttributes());
        product.setActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(new ProductImage(request.getImageUrls().get(i), i == 0, i));
            }
            product.setImages(images);
        }

        product = productRepository.save(product);
        log.info("Produit cree avec ID : {}", product.getId());

        return ApiResponse.success("Produit cree avec succes", enrichWithStock(catalogMapper.toProductResponse(product)));
    }

    @Override
    public ApiResponse<ProductResponse> getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return ApiResponse.success("Produit trouve", enrichWithStock(catalogMapper.toProductResponse(product)));
    }

    @Override
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        List<Product> products = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        return ApiResponse.success("Liste des produits", catalogMapper.toProductResponseList(products));
    }

    @Override
    public ApiResponse<List<ProductResponse>> getProductsByCategory(String categoryId) {
        List<Product> products = productRepository.findByCategoryIdAndActiveTrue(categoryId);
        return ApiResponse.success("Produits par categorie", catalogMapper.toProductResponseList(products));
    }

    @Override
    public ApiResponse<List<ProductResponse>> searchProducts(String keyword) {
        List<Product> products = productRepository.searchByTitle(keyword);
        return ApiResponse.success("Resultats de recherche", catalogMapper.toProductResponseList(products));
    }

    @Override
    public ApiResponse<List<ProductResponse>> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerIdAndActiveTrue(sellerId);
        return ApiResponse.success("Produits du vendeur", catalogMapper.toProductResponseList(products));
    }

    @Override
    public ApiResponse<ProductResponse> updateProduct(String id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategoryId(request.getCategoryId());
        product.setCondition(request.getCondition());
        product.setAttributes(request.getAttributes());
        product.setUpdatedAt(LocalDateTime.now());

        // Mettre à jour les images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(new ProductImage(request.getImageUrls().get(i), i == 0, i));
            }
            product.setImages(images);
        }

        product = productRepository.save(product);
        return ApiResponse.success("Produit mis a jour", catalogMapper.toProductResponse(product));
    }

    @Override
    public ApiResponse<Void> deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        product.setActive(false);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
        return ApiResponse.success("Produit desactive", null);
    }

    @Override
    public ApiResponse<Boolean> isAvailable(String productId, Integer quantity) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }
        try {
            Map response = webClient.get()
                    .uri(inventoryServiceUrl + "/api/inventory/product/" + productId + "/available?quantity=" + quantity)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            Boolean available = response != null && Boolean.TRUE.equals(response.get("data"));
            return ApiResponse.success(available ? "Disponible" : "Indisponible", available);
        } catch (Exception e) {
            log.warn("InventoryService indisponible, retour defaut true");
            return ApiResponse.success("Disponible (estimation)", true);
        }
    }

    private ProductResponse enrichWithStock(ProductResponse response) {
        try {
            Map stockResponse = webClient.get()
                    .uri(inventoryServiceUrl + "/api/inventory/product/" + response.getId())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            if (stockResponse != null && Boolean.TRUE.equals(stockResponse.get("success"))) {
                Map data = (Map) stockResponse.get("data");
                if (data != null) {
                    response.setStockQuantity((Integer) data.get("quantityAvailable"));
                }
            }
        } catch (Exception e) {
            log.debug("InventoryService indisponible pour le produit {}", response.getId());
        }
        return response;
    }
}