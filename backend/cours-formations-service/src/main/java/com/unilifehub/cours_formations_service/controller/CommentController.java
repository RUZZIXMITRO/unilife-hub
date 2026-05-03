package com.unilifehub.cours_formations_service.controller;

import com.unilifehub.cours_formations_service.dto.request.CommentRequest;
import com.unilifehub.cours_formations_service.dto.response.ApiResponse;
import com.unilifehub.cours_formations_service.dto.response.CommentResponse;
import com.unilifehub.cours_formations_service.entity.Comment;
import com.unilifehub.cours_formations_service.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Integer resourceId) {
        List<CommentResponse> responses = commentService
                .getCommentsByResource(resourceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Commentaires récupérés", responses));
    }

    @PostMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Integer resourceId,
            @Valid @RequestBody CommentRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", defaultValue = "Anonyme") String userName) {
        Comment comment = commentService.addComment(
                Integer.parseInt(userId), userName, resourceId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Commentaire ajouté", toResponse(comment)));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Integer commentId,
            @RequestHeader("X-User-Id") String userId) {
        commentService.deleteComment(commentId, Integer.parseInt(userId));
        return ResponseEntity.ok(ApiResponse.success("Commentaire supprimé", null));
    }

    @PostMapping("/{commentId}/report")
    public ResponseEntity<ApiResponse<CommentResponse>> reportComment(
            @PathVariable Integer commentId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Commentaire signalé",
                toResponse(commentService.reportComment(commentId))));
    }

    private CommentResponse toResponse(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .userName(c.getUserName())
                .resourceId(c.getResource().getId())
                .content(c.getContent())
                .isReported(c.getIsReported())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}