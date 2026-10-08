package com.unilife.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String parentId;
    private String iconUrl;
    private String description;

    public CreateCategoryRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
