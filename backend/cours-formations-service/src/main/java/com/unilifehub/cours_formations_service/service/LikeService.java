package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.entity.Like;
import com.unilifehub.cours_formations_service.entity.Resource;
import com.unilifehub.cours_formations_service.repository.LikeRepository;
import com.unilifehub.cours_formations_service.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final ResourceRepository resourceRepository;

    public boolean toggleLike(String userId, Integer resourceId) {
        if (likeRepository.existsByUserIdAndResourceId(userId, resourceId)) {
            likeRepository.deleteByUserIdAndResourceId(userId, resourceId);
            return false; // unliked
        } else {
            Resource resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));
            Like like = Like.builder()
                    .userId(userId)
                    .resource(resource)
                    .build();
            likeRepository.save(like);
            return true; // liked
        }
    }

    public long getLikesCount(Integer resourceId) {
        return likeRepository.countByResourceId(resourceId);
    }

    public boolean isLiked(String userId, Integer resourceId) {
        return likeRepository.existsByUserIdAndResourceId(userId, resourceId);
    }
}