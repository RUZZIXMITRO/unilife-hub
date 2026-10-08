package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Integer id;
    private String title;
    private String description;
    private String categoryName;
    private Integer categoryId;
    private Integer userId;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Integer downloadsCount;
    private Integer viewsCount;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private Boolean isFavorite;
}