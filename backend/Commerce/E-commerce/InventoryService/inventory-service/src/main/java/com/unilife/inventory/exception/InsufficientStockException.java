package com.unilife.inventory.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(Long productId, Integer requested, Integer available) {
        super(String.format("Stock insuffisant pour le produit %d : demandé=%d, disponible=%d",
                productId, requested, available));
    }
}
