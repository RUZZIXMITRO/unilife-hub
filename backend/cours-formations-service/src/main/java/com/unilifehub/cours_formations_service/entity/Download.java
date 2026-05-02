package com.unilifehub.cours_formations_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "downloads")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Download {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "downloaded_at")
    private LocalDateTime downloadedAt;

    @PrePersist
    protected void onCreate() {
        downloadedAt = LocalDateTime.now();
    }
}