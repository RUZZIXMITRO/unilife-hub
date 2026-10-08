package com.unilife.inventory.repository;

import com.unilife.inventory.model.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository pour les réservations de stock.
 */
@Repository
public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
    Optional<StockReservation> findByOrderIdAndProductId(Long orderId, Long productId);
    List<StockReservation> findByOrderId(Long orderId);
    List<StockReservation> findByExpiresAtBefore(LocalDateTime dateTime);
    void deleteByOrderId(Long orderId);
}
