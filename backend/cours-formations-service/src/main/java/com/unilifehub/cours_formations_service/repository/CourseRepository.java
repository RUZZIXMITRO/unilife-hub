package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    List<Course> findByIsApprovedTrueOrderByResource_CreatedAtDesc();

    List<Course> findByUserId(Integer userId);

    @Query("""
        SELECT c FROM Course c
        JOIN c.resource r
        WHERE c.isApproved = true
        AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:categoryId IS NULL OR r.category.id = :categoryId)
        ORDER BY c.downloadsCount DESC
    """)
    List<Course> searchCourses(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId
    );

    @Query("SELECT c FROM Course c WHERE c.isApproved = true ORDER BY c.downloadsCount DESC")
    List<Course> findPopularCourses();
}