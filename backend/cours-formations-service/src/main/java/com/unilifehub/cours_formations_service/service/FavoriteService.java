package com.unilifehub.cours_formations_service.service;
import com.unilifehub.cours_formations_service.entity.*;
import com.unilifehub.cours_formations_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final ResourceRepository resourceRepository;
    public Favorite addFavorite(String userId, Integer resourceId, String type) {
        if (favoriteRepository.existsByUserIdAndResourceId(userId, resourceId)) {
            throw new RuntimeException("Déjà dans les favoris");
        }
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));
        Favorite favorite = Favorite.builder()
                .userId(userId)
                .resource(resource)
                .resourceType(type)
                .build();
        return favoriteRepository.save(favorite);
    }
    @Transactional
    public void removeFavorite(String userId, Integer resourceId) {
        favoriteRepository.deleteByUserIdAndResourceId(userId, resourceId);
    }
    public List<Favorite> getMyFavorites(String userId) {
        return favoriteRepository.findByUserId(userId);
    }
}