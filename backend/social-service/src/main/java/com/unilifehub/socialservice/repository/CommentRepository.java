package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Récupérer les commentaires d'un post
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);

    // Récupérer les réponses à un commentaire
    List<Comment> findByParentCommentId(Long parentCommentId);

    // Compter les commentaires d'un post
    int countByPostId(Long postId);
}