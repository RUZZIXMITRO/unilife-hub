package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Integer> {

    List<Formation> findByLevelOrderByResource_CreatedAtDesc(String level);

    List<Formation> findByLanguage(String language);

    List<Formation> findByProvider(String provider);

    @Query("""
        SELECT f FROM Formation f
        JOIN f.resource r
        WHERE (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:level IS NULL OR f.level = :level)
        AND (:language IS NULL OR f.language = :language)
        AND (:categoryId IS NULL OR r.category.id = :categoryId)
        ORDER BY r.createdAt DESC
    """)
    List<Formation> searchFormations(
            @Param("keyword") String keyword,
            @Param("level") String level,
            @Param("language") String language,
            @Param("categoryId") Integer categoryId
    );
}