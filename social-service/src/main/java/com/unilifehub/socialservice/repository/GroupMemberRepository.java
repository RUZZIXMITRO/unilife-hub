package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    // Récupérer les membres d'un groupe
    List<GroupMember> findByGroupId(Long groupId);

    // Vérifier si un utilisateur est membre d'un groupe
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    // Récupérer les groupes d'un utilisateur
    List<GroupMember> findByUserId(Long userId);

    // Vérifier si membre existe déjà
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
}