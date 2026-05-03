package com.unilifehub.socialservice.service;

import com.unilifehub.socialservice.dto.request.CreateGroupRequest;
import com.unilifehub.socialservice.dto.response.GroupMemberResponse;
import com.unilifehub.socialservice.dto.response.GroupResponse;
import com.unilifehub.socialservice.entity.GroupMember;
import com.unilifehub.socialservice.entity.StudyGroup;
import com.unilifehub.socialservice.repository.GroupMemberRepository;
import com.unilifehub.socialservice.repository.StudyGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private StudyGroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository memberRepository;

    // Créer un groupe
    @Transactional
    public GroupResponse createGroup(String userId, CreateGroupRequest request) {
        StudyGroup group = StudyGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subject(request.getSubject())
                .creatorId(userId)
                .type(request.getType())
                .membersCount(1)
                .build();

        StudyGroup saved = groupRepository.save(group);

        // Ajouter le créateur comme admin
        GroupMember member = GroupMember.builder()
                .userId(userId)
                .group(saved)
                .role(GroupMember.MemberRole.ADMIN)
                .status(GroupMember.MemberStatus.ACCEPTED)
                .build();
        memberRepository.save(member);

        return mapToResponse(saved, userId);
    }

    // Rejoindre un groupe
    @Transactional
    public GroupResponse joinGroup(Long groupId, String userId) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Groupe non trouvé"));

        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("Vous êtes déjà membre");
        }

        // ✅ PENDING si groupe PRIVATE, ACCEPTED si PUBLIC
        // ✅ Après — le créateur toujours ACCEPTED
        GroupMember.MemberStatus status;
        if (group.getCreatorId().equals(userId)) {
        // Le créateur rejoint toujours directement
        status = GroupMember.MemberStatus.ACCEPTED;
        } else {
        // Les autres : PENDING si privé, ACCEPTED si public
        status = group.getType() == StudyGroup.GroupType.PRIVATE
                ? GroupMember.MemberStatus.PENDING
                : GroupMember.MemberStatus.ACCEPTED;
        }

        GroupMember member = GroupMember.builder()
                .userId(userId)
                .group(group)
                .role(GroupMember.MemberRole.MEMBER)
                .status(status)
                .build();

        memberRepository.save(member);

        // Incrémenter seulement si ACCEPTED
        if (status == GroupMember.MemberStatus.ACCEPTED) {
            group.setMembersCount(group.getMembersCount() + 1);
            groupRepository.save(group);
        }

        return mapToResponse(group, userId);
    }

    // Quitter un groupe
    @Transactional
    public void leaveGroup(Long groupId, String userId) {
        GroupMember member = memberRepository
                .findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Vous n'êtes pas membre"));

        memberRepository.delete(member);

        StudyGroup group = groupRepository.findById(groupId).get();
        group.setMembersCount(Math.max(0, group.getMembersCount() - 1));
        groupRepository.save(group);
    }

    // Rechercher des groupes
    public List<GroupResponse> searchGroups(String keyword, String userId) {
        return groupRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(group -> mapToResponse(group, userId))
                .collect(Collectors.toList());
    }

    // Récupérer tous les groupes publics
    // Retourner tous les groupes (publics ET privés)
public List<GroupResponse> getPublicGroups(String userId) {
    return groupRepository.findAll()
            .stream()
            .map(group -> mapToResponse(group, userId))
            .collect(Collectors.toList());
}

    private GroupResponse mapToResponse(StudyGroup group, String currentUserId) {
        boolean isMember = memberRepository
                .existsByGroupIdAndUserId(group.getId(), currentUserId);

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .subject(group.getSubject())
                .creatorId(group.getCreatorId())
                .type(group.getType().name())
                .membersCount(group.getMembersCount())
                .isMember(isMember)
                .createdAt(group.getCreatedAt())
                .build();
    }

    // Récupérer les membres d'un groupe
    public List<GroupMemberResponse> getGroupMembers(Long groupId) {
        return memberRepository.findByGroupId(groupId)
                .stream()
                .map(this::mapMemberToResponse)
                .collect(Collectors.toList());
    }

    // Membres en attente (PENDING)
    public List<GroupMemberResponse> getPendingMembers(Long groupId) {
        return memberRepository.findByGroupIdAndStatus(groupId, GroupMember.MemberStatus.PENDING)
                .stream()
                .map(this::mapMemberToResponse)
                .collect(Collectors.toList());
    }

    // Approuver un membre
    @Transactional
    public GroupMemberResponse approveMember(Long groupId, String userId, String adminId) {
        // Vérifier que celui qui approuve est admin
        GroupMember admin = memberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new RuntimeException("Vous n'êtes pas membre de ce groupe"));

        if (admin.getRole() != GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException("Vous n'avez pas les droits d'admin");
        }

        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Membre introuvable"));

        member.setStatus(GroupMember.MemberStatus.ACCEPTED);
        memberRepository.save(member);

        // Mettre à jour le compteur
        StudyGroup group = groupRepository.findById(groupId).get();
        group.setMembersCount(group.getMembersCount() + 1);
        groupRepository.save(group);

        return mapMemberToResponse(member);
    }

    // Rejeter un membre
    @Transactional
    public void rejectMember(Long groupId, String userId, String adminId) {
        // Vérifier que celui qui rejette est admin
        GroupMember admin = memberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new RuntimeException("Vous n'êtes pas membre de ce groupe"));

        if (admin.getRole() != GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException("Vous n'avez pas les droits d'admin");
        }

        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Membre introuvable"));

        memberRepository.delete(member);
    }

    // Retirer un membre (kick)
    @Transactional
    public void removeMember(Long groupId, String userId, String adminId) {
        GroupMember admin = memberRepository.findByGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new RuntimeException("Vous n'êtes pas membre de ce groupe"));

        if (admin.getRole() != GroupMember.MemberRole.ADMIN) {
            throw new RuntimeException("Vous n'avez pas les droits d'admin");
        }

        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Membre introuvable"));

        memberRepository.delete(member);

        StudyGroup group = groupRepository.findById(groupId).get();
        group.setMembersCount(Math.max(0, group.getMembersCount() - 1));
        groupRepository.save(group);
    }

    private GroupMemberResponse mapMemberToResponse(GroupMember m) {
        return GroupMemberResponse.builder()
                .id(m.getId())
                .userId(m.getUserId())
                .groupId(m.getGroup().getId())
                .role(m.getRole())
                .status(m.getStatus())
                .joinedAt(m.getJoinedAt())
                .build();
    }

    @Transactional
public void deleteGroup(Long groupId, String userId) {
    StudyGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Groupe introuvable"));

    if (!group.getCreatorId().equals(userId)) {
        throw new RuntimeException("Vous n'êtes pas le créateur de ce groupe");
    }

    groupRepository.delete(group);
}
}