package com.unilife.catalog.exception;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(String id) {
        super("Produit introuvable avec l ID : " + id);
    }
}
