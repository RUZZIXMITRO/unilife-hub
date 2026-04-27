package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.CreatePostRequest;
import com.unilifehub.socialservice.dto.response.PostResponse;
import com.unilifehub.socialservice.entity.Notification;
import com.unilifehub.socialservice.entity.Post;
import com.unilifehub.socialservice.entity.PostLike;
import com.unilifehub.socialservice.repository.PostLikeRepository;
import com.unilifehub.socialservice.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private NotificationService notificationService;

    // Créer un post
    public PostResponse createPost(Long userId, CreatePostRequest request) {
        Post post = Post.builder()
                .userId(userId)
                .content(request.getContent())
                .visibility(request.getVisibility())
                .groupId(request.getGroupId())
                .likesCount(0)
                .commentsCount(0)
                .build();

        Post saved = postRepository.save(post);
        return mapToResponse(saved, userId);
    }

    // Récupérer le feed (posts publics)
    public List<PostResponse> getFeed(Long userId) {
        return postRepository
                .findByVisibilityOrderByCreatedAtDesc(Post.Visibility.PUBLIC)
                .stream()
                .map(post -> mapToResponse(post, userId))
                .collect(Collectors.toList());
    }

    // Récupérer les posts d'un utilisateur
    public List<PostResponse> getUserPosts(Long userId) {
        return postRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(post -> mapToResponse(post, userId))
                .collect(Collectors.toList());
    }

    // Modifier un post
    public PostResponse updatePost(Long postId, Long userId, CreatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        post.setContent(request.getContent());
        post.setVisibility(request.getVisibility());

        Post updated = postRepository.save(post);
        return mapToResponse(updated, userId);
    }

    // Supprimer un post
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        postRepository.delete(post);
    }

    // Liker / Unliker un post
    public PostResponse toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));

        if (postLikeRepository.existsByUserIdAndPostId(userId, postId)) {
            // Déjà liké → on retire le like
            PostLike like = postLikeRepository
                    .findByUserIdAndPostId(userId, postId).get();
            postLikeRepository.delete(like);
            post.setLikesCount(post.getLikesCount() - 1);
        } else {
            // Pas encore liké → on ajoute le like
            PostLike like = PostLike.builder()
                    .userId(userId)
                    .post(post)
                    .build();
            postLikeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);

            // Notifier le propriétaire du post (sauf si c'est soi-même)
            if (!post.getUserId().equals(userId)) {
                notificationService.createNotification(
                        post.getUserId(),
                        userId,
                        Notification.NotificationType.LIKE,
                        "Quelqu'un a aimé votre post",
                        post.getId()
                );
            }
        }

        Post updated = postRepository.save(post);
        return mapToResponse(updated, userId);
    }

    // Récupérer un post par ID
    public PostResponse getPostById(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post non trouvé"));
        return mapToResponse(post, userId);
    }

    // Convertir Post → PostResponse
    private PostResponse mapToResponse(Post post, Long currentUserId) {
        boolean likedByMe = postLikeRepository
                .existsByUserIdAndPostId(currentUserId, post.getId());

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .content(post.getContent())
                .visibility(post.getVisibility().name())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .likedByMe(likedByMe)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}