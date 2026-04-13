package com.unilifehub.socialservice.controller;

import com.unilifehub.socialservice.dto.request.CreateGroupRequest;
import com.unilifehub.socialservice.dto.response.ApiResponse;
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
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
        return ResponseEntity.ok(
                ApiResponse.success("Groupe créé",
                        groupService.createGroup(userId, request)));
    }

    // POST /api/social/groups/{id}/join → rejoindre
    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<GroupResponse>> joinGroup(
            @PathVariable Long id,
            Authentication auth) {
        Long userId = (auth != null) ? (Long) auth.getPrincipal() : 0L;
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
}