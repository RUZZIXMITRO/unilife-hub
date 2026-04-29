package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.request.CreatePostRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.PostResponse;
import com.unilifehub.socialservice.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/posts")
public class PostController {

    @Autowired
    private PostService postService;

    // GET /api/social/posts → feed public
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeed(
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        List<PostResponse> posts = postService.getFeed(userId);
        return ResponseEntity.ok(ApiResponse.success("Feed récupéré", posts));
    }

    // GET /api/social/posts/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getUserPosts(
            @PathVariable String userId,
            Authentication auth) {
        String currentUserId = AuthUtils.getRequiredUserId(auth);
        List<PostResponse> posts = postService.getUserPosts(userId);
        return ResponseEntity.ok(ApiResponse.success("Posts récupérés", posts));
    }

    // POST /api/social/posts → créer un post
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        PostResponse post = postService.createPost(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Post créé", post));
    }

    // PUT /api/social/posts/{id} → modifier un post
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        PostResponse post = postService.updatePost(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Post modifié", post));
    }

    // DELETE /api/social/posts/{id} → supprimer un post
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        postService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post supprimé"));
    }

    // POST /api/social/posts/{id}/like → liker/unliker
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostResponse>> toggleLike(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        PostResponse post = postService.toggleLike(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Like mis à jour", post));
    }

    // GET /api/social/posts/{id} → récupérer un post par ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        PostResponse post = postService.getPostById(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post récupéré", post));
    }
}