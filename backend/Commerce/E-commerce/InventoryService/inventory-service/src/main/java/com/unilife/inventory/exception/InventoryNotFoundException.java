package com.unilife.inventory.exception;

/**
 * Exception levée quand un produit n'existe pas en stock.
 * SOLID - S : chaque exception a une signification précise.
 */
public class InventoryNotFoundException extends RuntimeException {
    public InventoryNotFoundException(Long productId) {
        super("Stock introuvable pour le produit ID : " + productId);
    }
}
