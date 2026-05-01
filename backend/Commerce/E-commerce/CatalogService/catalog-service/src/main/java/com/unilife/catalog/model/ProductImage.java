package com.unilife.catalog.model;

/**
 * Image d'un produit - document imbrique dans Product.
 * SOLID - S : represente uniquement une image.
 * MongoDB : pas besoin de table separee, l'image vit dans le document Product.
 */
public class ProductImage {
    private String imageUrl;
    private boolean primary;
    private int orderNum;

    public ProductImage() {}

    public ProductImage(String imageUrl, boolean primary, int orderNum) {
        this.imageUrl = imageUrl;
        this.primary = primary;
        this.orderNum = orderNum;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isPrimary() { return primary; }
    public void setPrimary(boolean primary) { this.primary = primary; }
    public int getOrderNum() { return orderNum; }
    public void setOrderNum(int orderNum) { this.orderNum = orderNum; }
}
