package com.unilife.catalog.repository;

import com.unilife.catalog.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository MongoDB pour les produits.
 * SOLID - D : depend de MongoRepository (abstraction), pas d'implementation concrete.
 * Design Pattern : Repository Pattern.
 *
 * MongoRepository = equivalent de JpaRepository mais pour MongoDB.
 * Spring Data genere automatiquement les requetes depuis les noms de methodes !
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByActiveTrue();

    List<Product> findByCategoryIdAndActiveTrue(String categoryId);

    List<Product> findBySellerIdAndActiveTrue(Long sellerId);

    @Query("{ 'title': { $regex: ?0, $options: 'i' }, 'active': true }")
    List<Product> searchByTitle(String keyword);

    @Query("{ 'price': { $gte: ?0, $lte: ?1 }, 'active': true }")
    List<Product> findByPriceBetweenAndActiveTrue(BigDecimal min, BigDecimal max);

    List<Product> findByActiveTrueOrderByCreatedAtDesc();
}
