package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.dto.response.FavoriteResponse;
import com.unilifehub.cours_formations_service.entity.*;
import com.unilifehub.cours_formations_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ResourceRepository resourceRepository;

    public boolean addFavorite(String userId, Integer resourceId, String type) {
        if (favoriteRepository.existsByUserIdAndResourceId(userId, resourceId)) {
            return true; // Déjà en favori
        }
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        Favorite favorite = Favorite.builder()
                .userId(userId)
                .resource(resource)
                .resourceType(type)
                .build();
        favoriteRepository.save(favorite);
        return true;
    }

    @Transactional
    public void removeFavorite(String userId, Integer resourceId) {
        favoriteRepository.deleteByUserIdAndResourceId(userId, resourceId);
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> getMyFavorites(String userId) {
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(favorite -> FavoriteResponse.builder()
                        .id(favorite.getId())
                        .resourceId(favorite.getResource().getId())
                        .resourceType(favorite.getResourceType())
                        .title(favorite.getResource().getTitle())
                        .description(favorite.getResource().getDescription())
                        .categoryName(favorite.getResource().getCategory() != null
                                ? favorite.getResource().getCategory().getName()
                                : null)
                        .build())
                .collect(Collectors.toList());
    }
}