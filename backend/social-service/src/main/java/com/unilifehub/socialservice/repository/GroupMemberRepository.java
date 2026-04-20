package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    // Récupérer les membres d'un groupe
    @Query("SELECT m FROM GroupMember m WHERE m.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") Long groupId);

    // Vérifier si un utilisateur est membre d'un groupe
    @Query("SELECT m FROM GroupMember m WHERE m.group.id = :groupId AND m.userId = :userId")
    Optional<GroupMember> findByGroupIdAndUserId(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId);

    // Récupérer les groupes d'un utilisateur
    List<GroupMember> findByUserId(Long userId);

    // Vérifier si membre existe déjà
    @Query("SELECT COUNT(m) > 0 FROM GroupMember m WHERE m.group.id = :groupId AND m.userId = :userId")
    boolean existsByGroupIdAndUserId(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId);

    // Membres par statut
    @Query("SELECT m FROM GroupMember m WHERE m.group.id = :groupId AND m.status = :status")
    List<GroupMember> findByGroupIdAndStatus(
            @Param("groupId") Long groupId,
            @Param("status") GroupMember.MemberStatus status);

    // Compter membres acceptés
    @Query("SELECT COUNT(m) FROM GroupMember m WHERE m.group.id = :groupId AND m.status = :status")
    long countByGroupIdAndStatus(
            @Param("groupId") Long groupId,
            @Param("status") GroupMember.MemberStatus status);
}