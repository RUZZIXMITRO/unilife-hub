package com.unilife.catalog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

/**
 * Categorie de produits.
 * SOLID - S : represente uniquement la donnee categorie.
 * MongoDB : @Document = equivalent de @Entity en JPA.
 */
@Document(collection = "categories")
public class Category {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String parentId;
    private String iconUrl;
    private String description;
    private LocalDateTime createdAt;

    public Category() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
