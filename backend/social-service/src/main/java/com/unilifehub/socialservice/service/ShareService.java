package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.ShareResponse;
import com.unilifehub.socialservice.entity.Share;
import com.unilifehub.socialservice.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShareService {

    @Autowired
    private ShareRepository shareRepository;

    // Partager un post
    public ShareResponse sharePost(Long postId, Long userId) {
        // Vérifier si déjà partagé
        if (shareRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new RuntimeException("Vous avez déjà partagé ce post");
        }

        Share share = new Share();
        share.setPostId(postId);
        share.setUserId(userId);

        Share saved = shareRepository.save(share);

        long shareCount = shareRepository.countByPostId(postId);
        return mapToDto(saved, shareCount);
    }

    // Récupérer les partages d'un post
    public List<Share> getSharesByPost(Long postId) {
        return shareRepository.findByPostId(postId);
    }

    // Compter les partages d'un post
    public long countShares(Long postId) {
        return shareRepository.countByPostId(postId);
    }

    // Annuler un partage
    public void unsharePost(Long postId, Long userId) {
        List<Share> shares = shareRepository.findByPostId(postId)
                .stream()
                .filter(s -> s.getUserId().equals(userId))
                .toList();

        if (shares.isEmpty()) {
            throw new RuntimeException("Partage introuvable");
        }
        shareRepository.delete(shares.get(0));
    }

    private ShareResponse mapToDto(Share share, long shareCount) {
        return new ShareResponse(
                share.getId(),
                share.getPostId(),
                share.getUserId(),
                share.getCreatedAt(),
                shareCount
        );
    }
}