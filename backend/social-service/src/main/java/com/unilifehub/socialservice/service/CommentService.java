package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.CreateCommentRequest;
import com.unilifehub.socialservice.dto.response.CommentResponse;
import com.unilifehub.socialservice.entity.Comment;
import com.unilifehub.socialservice.entity.Notification;
import com.unilifehub.socialservice.entity.Post;
import com.unilifehub.socialservice.repository.CommentRepository;
import com.unilifehub.socialservice.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private NotificationService notificationService;

    // Ajouter un commentaire
    public CommentResponse addComment(Long postId, Long userId,
                                      CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        Comment comment = Comment.builder()
                .userId(userId)
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .post(post)
                .build();

        Comment saved = commentRepository.save(comment);

        // Mettre à jour le compteur de commentaires
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // Notifier le propriétaire du post (sauf si c'est soi-même)
        if (!post.getUserId().equals(userId)) {
            notificationService.createNotification(
                    post.getUserId(),
                    userId,
                    Notification.NotificationType.COMMENT,
                    "Quelqu'un a commenté votre post",
                    post.getId()
            );
        }

        return mapToResponse(saved);
    }

    // Récupérer les commentaires d'un post
    public List<CommentResponse> getComments(Long postId) {
        return commentRepository
                .findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Supprimer un commentaire
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        // Mettre à jour le compteur
        Post post = comment.getPost();
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .parentCommentId(comment.getParentCommentId())
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}