package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.request.CreateGroupRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
import com.unilifehub.socialservice.dto.response.GroupMemberResponse;
import java.util.Map;
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
@CrossOrigin(origins = "http://localhost:4200")
public class GroupController {

    @Autowired
    private GroupService groupService;

    // GET /api/social/groups → groupes publics
    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getPublicGroups(
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Groupes récupérés",
                        groupService.getPublicGroups(userId)));
    }

    // GET /api/social/groups/search?keyword=math
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> searchGroups(
            @RequestParam String keyword,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Résultats",
                        groupService.searchGroups(keyword, userId)));
    }

    // POST /api/social/groups → créer un groupe
    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Groupe créé",
                        groupService.createGroup(userId, request)));
    }

    // POST /api/social/groups/{id}/join → rejoindre
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<GroupResponse>> joinGroup(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Groupe rejoint",
                        groupService.joinGroup(id, userId)));
    }

    // DELETE /api/social/groups/{id}/leave → quitter
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
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
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long adminId) {
        return ResponseEntity.ok(
                ApiResponse.success("Membre approuvé",
                        groupService.approveMember(id, userId, adminId)));
    }

    // PUT /api/social/groups/{id}/members/{userId}/reject
    @PutMapping("/{id}/members/{userId}/reject")
    public ResponseEntity<?> rejectMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long adminId) {
        try {
            groupService.rejectMember(id, userId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Membre rejeté"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage()));
        }
    }

    // DELETE /api/social/groups/{id}/members/{userId}
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long adminId) {
        try {
            groupService.removeMember(id, userId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Membre retiré"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage()));
        }
    }
}