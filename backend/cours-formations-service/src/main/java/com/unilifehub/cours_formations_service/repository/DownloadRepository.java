package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Download;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Integer> {
    List<Download> findByUserId(Integer userId);
    List<Download> findByCourseId(Integer courseId);
    boolean existsByUserIdAndCourseId(Integer userId, Integer courseId);
    long countByUserId(Integer userId);
}