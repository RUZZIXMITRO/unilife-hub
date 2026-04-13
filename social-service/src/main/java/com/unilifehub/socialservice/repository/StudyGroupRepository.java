package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    // Rechercher par nom
    List<StudyGroup> findByNameContainingIgnoreCase(String name);

    // Récupérer les groupes publics
    List<StudyGroup> findByType(StudyGroup.GroupType type);

    // Récupérer les groupes créés par un utilisateur
    List<StudyGroup> findByCreatorId(Long creatorId);
}