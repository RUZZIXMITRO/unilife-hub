package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // Vérifier si un utilisateur a liké un post
    Optional<PostLike> findByUserIdAndPostId(String userId, Long postId);

    // Vérifier existence
    boolean existsByUserIdAndPostId(String userId, Long postId);
}