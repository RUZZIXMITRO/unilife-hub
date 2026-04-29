package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.GroupPostResponse;
import com.unilifehub.socialservice.service.GroupPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/groups")
public class GroupPostController {

    @Autowired
    private GroupPostService groupPostService;

    // POST /api/social/groups/{groupId}/posts/{postId}
    @PostMapping("/{groupId}/posts/{postId}")
    public ResponseEntity<ApiResponse<GroupPostResponse>> addPostToGroup(
            @PathVariable Long groupId,
            @PathVariable Long postId,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        GroupPostResponse dto = groupPostService.addPostToGroup(groupId, postId, userId);
        return ResponseEntity.ok(ApiResponse.success("Post publié dans le groupe", dto));
    }

    // GET /api/social/groups/{groupId}/posts
    @GetMapping("/{groupId}/posts")
    public ResponseEntity<ApiResponse<List<GroupPostResponse>>> getGroupPosts(
            @PathVariable Long groupId) {
        List<GroupPostResponse> list = groupPostService.getGroupPosts(groupId);
        return ResponseEntity.ok(ApiResponse.success("Posts du groupe récupérés", list));
    }

    // DELETE /api/social/groups/posts/{groupPostId}
    @DeleteMapping("/posts/{groupPostId}")
    public ResponseEntity<ApiResponse<Void>> removePost(
            @PathVariable Long groupPostId,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        groupPostService.removePostFromGroup(groupPostId, userId);
        return ResponseEntity.ok(ApiResponse.success("Post retiré du groupe"));
    }
}