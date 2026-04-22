package com.unilifehub.cours_formations_service.service;

import com.unilifehub.cours_formations_service.entity.Comment;
import com.unilifehub.cours_formations_service.entity.Resource;
import com.unilifehub.cours_formations_service.repository.CommentRepository;
import com.unilifehub.cours_formations_service.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ResourceRepository resourceRepository;

    public List<Comment> getCommentsByResource(Integer resourceId) {
        return commentRepository.findByResourceIdOrderByCreatedAtDesc(resourceId);
    }

    public Comment addComment(Integer userId, String userName,
                              Integer resourceId, String content) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Ressource non trouvée"));

        Comment comment = Comment.builder()
                .userId(userId)
                .userName(userName)
                .resource(resource)
                .content(content)
                .isReported(false)
                .build();
        return commentRepository.save(comment);
    }

    public void deleteComment(Integer commentId, Integer userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));
        if (!comment.getUserId().equals(userId))
            throw new RuntimeException("Non autorisé");
        commentRepository.deleteById(commentId);
    }

    public Comment reportComment(Integer commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));
        comment.setIsReported(true);
        return commentRepository.save(comment);
    }

    public List<Comment> getReportedComments() {
        return commentRepository.findByIsReportedTrue();
    }

    public void adminDeleteComment(Integer commentId) {
        if (!commentRepository.existsById(commentId))
            throw new RuntimeException("Commentaire non trouvé");
        commentRepository.deleteById(commentId);
    }
}