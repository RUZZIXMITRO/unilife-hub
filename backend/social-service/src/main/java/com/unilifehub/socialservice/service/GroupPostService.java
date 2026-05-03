package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.response.GroupPostResponse;
import com.unilifehub.socialservice.entity.GroupPost;
import com.unilifehub.socialservice.repository.GroupPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupPostService {

    @Autowired
    private GroupPostRepository groupPostRepository;

    // Publier un post dans un groupe
    public GroupPostResponse addPostToGroup(Long groupId, Long postId, String userId) {
        if (groupPostRepository.existsByGroupIdAndPostId(groupId, postId)) {
            throw new RuntimeException("Ce post est déjà publié dans ce groupe");
        }

        GroupPost gp = new GroupPost();
        gp.setGroupId(groupId);
        gp.setPostId(postId);
        gp.setPostedBy(userId);

        return mapToDto(groupPostRepository.save(gp));
    }

    // Récupérer les posts d'un groupe
    public List<GroupPostResponse> getGroupPosts(Long groupId) {
        return groupPostRepository
                .findByGroupIdOrderByPostedAtDesc(groupId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Supprimer un post d'un groupe
    public void removePostFromGroup(Long groupPostId, String userId) {
        GroupPost gp = groupPostRepository.findById(groupPostId)
                .orElseThrow(() -> new RuntimeException("GroupPost introuvable"));

        if (!gp.getPostedBy().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez pas supprimer ce post");
        }
        groupPostRepository.delete(gp);
    }

    // Compter les posts d'un groupe
    public long countGroupPosts(Long groupId) {
        return groupPostRepository.countByGroupId(groupId);
    }

    private GroupPostResponse mapToDto(GroupPost gp) {
        return new GroupPostResponse(
                gp.getId(), gp.getGroupId(),
                gp.getPostId(), gp.getPostedBy(), gp.getPostedAt()
        );
    }
}