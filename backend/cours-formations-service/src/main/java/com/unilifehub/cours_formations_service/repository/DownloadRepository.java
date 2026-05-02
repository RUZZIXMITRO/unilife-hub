package com.unilifehub.cours_formations_service.repository;
import org.springframework.transaction.annotation.Transactional;



import com.unilifehub.cours_formations_service.entity.Download;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Integer> {
    List<Download> findByUserId(String userId);
    List<Download> findByCourseId(Integer courseId);
    boolean existsByUserIdAndCourseId(String userId, Integer courseId);
    long countByUserId(String userId);
    @Transactional
    void deleteByCourseId(Integer courseId);
}