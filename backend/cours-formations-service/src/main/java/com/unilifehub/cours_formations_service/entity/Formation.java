package com.unilifehub.cours_formations_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "formations")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    private Resource resource;

    @Column(length = 255)
    private String provider;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(length = 100)
    private String duration;

    @Column(length = 50)
    private String level;

    @Column(length = 50)
    private String language;

    @Column(name = "is_external")
    private Boolean isExternal = false;

    @Column(name = "clicks_count")
    private Integer clicksCount = 0;
}