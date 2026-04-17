package com.unilifehub.cours_formations_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "courses")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    private Resource resource;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name", length = 500)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @Column(name = "downloads_count")
    private Integer downloadsCount = 0;

    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Column(name = "is_approved")
    private Boolean isApproved = false;
}