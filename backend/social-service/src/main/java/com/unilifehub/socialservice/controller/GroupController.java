package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.config.AuthUtils;
import com.unilifehub.socialservice.dto.request.CreateGroupRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.GroupMemberResponse;
import com.unilifehub.socialservice.dto.response.GroupResponse;
import com.unilifehub.socialservice.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    // GET /api/social/groups → groupes publics
    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getPublicGroups(
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Groupes récupérés",
                        groupService.getPublicGroups(userId)));
    }

    // GET /api/social/groups/search?keyword=math
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> searchGroups(
            @RequestParam String keyword,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Résultats",
                        groupService.searchGroups(keyword, userId)));
    }

    // POST /api/social/groups → créer un groupe
    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Groupe créé",
                        groupService.createGroup(userId, request)));
    }

    // POST /api/social/groups/{id}/join → rejoindre
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<GroupResponse>> joinGroup(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Groupe rejoint",
                        groupService.joinGroup(id, userId)));
    }

    // DELETE /api/social/groups/{id}/leave → quitter
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @PathVariable Long id,
            Authentication auth) {
        String userId = AuthUtils.getRequiredUserId(auth);
        groupService.leaveGroup(id, userId);
        return ResponseEntity.ok(
                ApiResponse.success("Groupe quitté"));
    }

    // GET /api/social/groups/{id}/members — liste des membres
    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getMembers(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Membres récupérés",
                        groupService.getGroupMembers(id)));
    }

    // GET /api/social/groups/{id}/members/pending — membres en attente
    @GetMapping("/{id}/members/pending")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getPendingMembers(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Membres en attente",
                        groupService.getPendingMembers(id)));
    }

    // PUT /api/social/groups/{id}/members/{userId}/approve
    @PutMapping("/{id}/members/{userId}/approve")
    public ResponseEntity<ApiResponse<GroupMemberResponse>> approveMember(
            @PathVariable Long id,
            @PathVariable String userId,
            Authentication auth) {
        String adminId = AuthUtils.getRequiredUserId(auth);
        return ResponseEntity.ok(
                ApiResponse.success("Membre approuvé",
                        groupService.approveMember(id, userId, adminId)));
    }

    // PUT /api/social/groups/{id}/members/{userId}/reject
    @PutMapping("/{id}/members/{userId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectMember(
            @PathVariable Long id,
            @PathVariable String userId,
            Authentication auth) {
        String adminId = AuthUtils.getRequiredUserId(auth);
        groupService.rejectMember(id, userId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Membre rejeté"));
    }

    // DELETE /api/social/groups/{id}/members/{userId}
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long id,
            @PathVariable String userId,
            Authentication auth) {
        String adminId = AuthUtils.getRequiredUserId(auth);
        groupService.removeMember(id, userId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Membre retiré"));
    }
}