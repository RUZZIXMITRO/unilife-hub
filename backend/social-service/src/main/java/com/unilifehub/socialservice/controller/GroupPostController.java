package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.response.GroupPostResponse;
import com.unilifehub.socialservice.service.GroupPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social/groups")
@CrossOrigin(origins = "*")
public class GroupPostController {

    @Autowired
    private GroupPostService groupPostService;

    // POST /api/social/groups/{groupId}/posts/{postId}
    @PostMapping("/{groupId}/posts/{postId}")
    public ResponseEntity<?> addPostToGroup(
            @PathVariable Long groupId,
            @PathVariable Long postId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            GroupPostResponse dto = groupPostService.addPostToGroup(groupId, postId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Post publié dans le groupe",
                    "data", dto
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // GET /api/social/groups/{groupId}/posts
    @GetMapping("/{groupId}/posts")
    public ResponseEntity<?> getGroupPosts(@PathVariable Long groupId) {
        List<GroupPostResponse> list = groupPostService.getGroupPosts(groupId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", list
        ));
    }

    // DELETE /api/social/groups/posts/{groupPostId}
    @DeleteMapping("/posts/{groupPostId}")
    public ResponseEntity<?> removePost(
            @PathVariable Long groupPostId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            groupPostService.removePostFromGroup(groupPostId, userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Post retiré du groupe"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}