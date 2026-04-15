package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Récupérer tous les posts d'un utilisateur
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Récupérer les posts publics (feed)
    List<Post> findByVisibilityOrderByCreatedAtDesc(Post.Visibility visibility);

    // Récupérer les posts d'un groupe
    List<Post> findByGroupIdOrderByCreatedAtDesc(Long groupId);
}