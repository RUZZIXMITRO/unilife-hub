package com.unilife.catalog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Produit du catalogue e-commerce.
 * SOLID - S : represente uniquement la donnee produit.
 *
 * Pourquoi MongoDB ?
 * Les attributs varient selon la categorie :
 * - Livre : auteur, pages, isbn
 * - Electronique : marque, garantie, voltage
 * MongoDB permet ces attributs variables via Map<String, Object> attributes.
 */
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @TextIndexed
    private String title;

    private String description;
    private BigDecimal price;

    @Indexed
    private String categoryId;

    private String condition;

    @Indexed
    private Long sellerId;

    private List<ProductImage> images;

    // Attributs flexibles selon la categorie (le pouvoir de MongoDB !)
    private Map<String, Object> attributes;

    @Indexed
    private boolean active;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public Map<String, Object> getAttributes() { return attributes; }
    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
