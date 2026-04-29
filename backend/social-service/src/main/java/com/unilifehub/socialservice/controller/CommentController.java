package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.request.CreateCommentRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.CommentResponse;
import com.unilifehub.socialservice.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/posts/{postId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // GET /api/social/posts/{postId}/comments
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long postId) {
        return ResponseEntity.ok(
                ApiResponse.success("Commentaires récupérés",
                        commentService.getComments(postId)));
    }

    // POST /api/social/posts/{postId}/comments
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Commentaire ajouté",
                        commentService.addComment(postId, userId, request)));
    }

    // DELETE /api/social/posts/{postId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Commentaire supprimé"));
    }
}