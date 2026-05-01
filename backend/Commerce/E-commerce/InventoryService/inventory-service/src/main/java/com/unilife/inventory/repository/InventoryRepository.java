package com.unilife.inventory.repository;

import com.unilife.inventory.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'accès aux données du stock.
 * SOLID - D : on dépend de l'abstraction JpaRepository, pas d'une implémentation concrète.
 * Design Pattern : Repository Pattern — toutes les DB calls sont ici, jamais dans le service.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    boolean existsByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable <= i.alertThreshold")
    List<Inventory> findLowStockItems();

    List<Inventory> findByQuantityAvailableGreaterThan(Integer quantity);
}
