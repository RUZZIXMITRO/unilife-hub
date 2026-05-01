package com.unilife.catalog.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String id) {
        super("Categorie introuvable avec l ID : " + id);
    }
}
