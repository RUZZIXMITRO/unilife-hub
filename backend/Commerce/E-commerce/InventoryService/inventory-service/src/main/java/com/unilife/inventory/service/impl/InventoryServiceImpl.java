package com.unilife.inventory.service.impl;

import com.unilife.inventory.dto.request.AddStockRequest;
import com.unilife.inventory.dto.request.CreateInventoryRequest;
import com.unilife.inventory.dto.request.ReserveStockRequest;
import com.unilife.inventory.dto.response.ApiResponse;
import com.unilife.inventory.dto.response.InventoryResponse;
import com.unilife.inventory.dto.response.StockMovementResponse;
import com.unilife.inventory.exception.InsufficientStockException;
import com.unilife.inventory.exception.InventoryNotFoundException;
import com.unilife.inventory.mapper.InventoryMapper;
import com.unilife.inventory.model.Inventory;
import com.unilife.inventory.model.StockMovement;
import com.unilife.inventory.model.StockMovement.MovementType;
import com.unilife.inventory.model.StockReservation;
import com.unilife.inventory.repository.InventoryRepository;
import com.unilife.inventory.repository.StockMovementRepository;
import com.unilife.inventory.repository.StockReservationRepository;
import com.unilife.inventory.service.IInventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class InventoryServiceImpl implements IInventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository movementRepository;
    private final StockReservationRepository reservationRepository;
    private final InventoryMapper inventoryMapper;

    public InventoryServiceImpl(InventoryRepository inventoryRepository,
                                 StockMovementRepository movementRepository,
                                 StockReservationRepository reservationRepository,
                                 InventoryMapper inventoryMapper) {
        this.inventoryRepository = inventoryRepository;
        this.movementRepository = movementRepository;
        this.reservationRepository = reservationRepository;
        this.inventoryMapper = inventoryMapper;
    }

    @Override
    @Transactional
    public ApiResponse<InventoryResponse> createInventory(CreateInventoryRequest request) {
        log.info("Création du stock pour le produit ID: {}", request.getProductId());
        if (inventoryRepository.existsByProductId(request.getProductId())) {
            return ApiResponse.error("Un stock existe déjà pour ce produit");
        }
        Inventory inventory = new Inventory();
        inventory.setProductId(request.getProductId());
        inventory.setQuantityAvailable(request.getQuantityAvailable());
        inventory.setQuantityReserved(0);
        inventory.setAlertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 10);
        inventory = inventoryRepository.save(inventory);
        saveMovement(inventory.getProductId(), MovementType.ADD, request.getQuantityAvailable(), "Stock initial", null);
        return ApiResponse.success("Stock créé avec succès", inventoryMapper.toResponse(inventory));
    }

    @Override
    public ApiResponse<InventoryResponse> getInventoryByProductId(Long productId) {
        Inventory inventory = findInventoryOrThrow(productId);
        return ApiResponse.success("Stock récupéré", inventoryMapper.toResponse(inventory));
    }

    @Override
    public ApiResponse<List<InventoryResponse>> getAllInventories() {
        return ApiResponse.success("Liste des stocks", inventoryMapper.toResponseList(inventoryRepository.findAll()));
    }

    @Override
    public ApiResponse<List<InventoryResponse>> getLowStockItems() {
        return ApiResponse.success("Produits en stock faible", inventoryMapper.toResponseList(inventoryRepository.findLowStockItems()));
    }

    @Override
    @Transactional
    public ApiResponse<InventoryResponse> addStock(Long productId, AddStockRequest request) {
        Inventory inventory = findInventoryOrThrow(productId);
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        saveMovement(productId, MovementType.ADD, request.getQuantity(), request.getReason(), request.getCreatedBy());
        return ApiResponse.success("Stock ajouté avec succès", inventoryMapper.toResponse(inventory));
    }

    @Override
    @Transactional
    public ApiResponse<InventoryResponse> removeStock(Long productId, AddStockRequest request) {
        Inventory inventory = findInventoryOrThrow(productId);
        if (inventory.getQuantityAvailable() < request.getQuantity()) {
            throw new InsufficientStockException(productId, request.getQuantity(), inventory.getQuantityAvailable());
        }
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        saveMovement(productId, MovementType.REMOVE, request.getQuantity(), request.getReason(), request.getCreatedBy());
        return ApiResponse.success("Stock retiré avec succès", inventoryMapper.toResponse(inventory));
    }

    @Override
    @Transactional
    public ApiResponse<InventoryResponse> reserveStock(Long productId, ReserveStockRequest request) {
        Inventory inventory = findInventoryOrThrow(productId);
        if (inventory.getQuantityAvailable() < request.getQuantity()) {
            throw new InsufficientStockException(productId, request.getQuantity(), inventory.getQuantityAvailable());
        }
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantity());
        inventory.setQuantityReserved(inventory.getQuantityReserved() + request.getQuantity());
        inventory = inventoryRepository.save(inventory);
        StockReservation reservation = new StockReservation();
        reservation.setProductId(productId);
        reservation.setOrderId(request.getOrderId());
        reservation.setQuantity(request.getQuantity());
        reservationRepository.save(reservation);
        saveMovement(productId, MovementType.RESERVE, request.getQuantity(), "Réservation commande #" + request.getOrderId(), null);
        return ApiResponse.success("Stock réservé avec succès", inventoryMapper.toResponse(inventory));
    }

    @Override
    @Transactional
    public ApiResponse<InventoryResponse> releaseStock(Long productId, Long orderId) {
        Inventory inventory = findInventoryOrThrow(productId);
        StockReservation reservation = reservationRepository
                .findByOrderIdAndProductId(orderId, productId)
                .orElseThrow(() -> new InventoryNotFoundException(productId));
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + reservation.getQuantity());
        inventory.setQuantityReserved(inventory.getQuantityReserved() - reservation.getQuantity());
        inventory = inventoryRepository.save(inventory);
        reservationRepository.delete(reservation);
        saveMovement(productId, MovementType.RELEASE, reservation.getQuantity(), "Libération commande #" + orderId, null);
        return ApiResponse.success("Stock libéré avec succès", inventoryMapper.toResponse(inventory));
    }

    @Override
    public ApiResponse<List<StockMovementResponse>> getMovementsByProductId(Long productId) {
        return ApiResponse.success("Historique", inventoryMapper.toMovementResponseList(
                movementRepository.findByProductIdOrderByCreatedAtDesc(productId)));
    }

    @Override
    public ApiResponse<Boolean> isAvailable(Long productId, Integer quantity) {
        Inventory inventory = findInventoryOrThrow(productId);
        boolean available = inventory.getQuantityAvailable() >= quantity;
        return ApiResponse.success(available ? "Stock disponible" : "Stock insuffisant", available);
    }

    private Inventory findInventoryOrThrow(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException(productId));
    }

    private void saveMovement(Long productId, MovementType type, Integer quantity, String reason, Long createdBy) {
        StockMovement movement = new StockMovement();
        movement.setProductId(productId);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setCreatedBy(createdBy);
        movementRepository.save(movement);
    }
}
