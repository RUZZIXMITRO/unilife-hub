package com.unilifehub.cours_formations_service.repository;

import com.unilifehub.cours_formations_service.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {
    List<Report> findByIsResolvedFalse();
    List<Report> findByResourceId(Integer resourceId);
    boolean existsByUserIdAndResourceId(Integer userId, Integer resourceId);
}