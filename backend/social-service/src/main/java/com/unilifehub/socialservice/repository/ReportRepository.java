package com.unilifehub.socialservice.repository;

import com.unilifehub.socialservice.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByStatus(Report.ReportStatus status);

    List<Report> findByReporterId(Long reporterId);

    List<Report> findByContentIdAndContentType(Long contentId, Report.ContentType contentType);

    boolean existsByReporterIdAndContentIdAndContentType(
            Long reporterId, Long contentId, Report.ContentType contentType);

    long countByStatus(Report.ReportStatus status);
}