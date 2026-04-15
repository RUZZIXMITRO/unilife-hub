package com.unilifehub.socialservice.controller;

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
@CrossOrigin(origins = "http://localhost:4200")
public class PostController {

    @Autowired
    private PostService postService;

    // GET /api/social/posts → feed public
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getFeed(
            Authentication auth) {

        // Si pas authentifié, utiliser userId = 0
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;

        List<PostResponse> posts = postService.getFeed(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Feed récupéré", posts));
    }

    // GET /api/social/posts/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getUserPosts(
            @PathVariable Long userId,
            Authentication auth) {
        Long currentUserId = (Long) auth.getPrincipal();
        List<PostResponse> posts = postService.getUserPosts(userId);
        return ResponseEntity.ok(
                ApiResponse.success("Posts récupérés", posts));
    }

    // POST /api/social/posts → créer un post
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        PostResponse post = postService.createPost(userId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Post créé", post));
    }

    // PUT /api/social/posts/{id} → modifier un post
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        PostResponse post = postService.updatePost(id, userId, request);
        return ResponseEntity.ok(
                ApiResponse.success("Post modifié", post));
    }

    // DELETE /api/social/posts/{id} → supprimer un post
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        postService.deletePost(id, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Post supprimé"));
    }

    // POST /api/social/posts/{id}/like → liker/unliker
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<PostResponse>> toggleLike(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        PostResponse post = postService.toggleLike(id, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Like mis à jour", post));
    }
}