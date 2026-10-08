package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationResponse {
    private Integer id;
    private String title;
    private String description;
    private String categoryName;
    private Integer categoryId;
    private String provider;
    private String linkUrl;
    private String duration;
    private String level;
    private String language;
    private Boolean isExternal;
    private Integer clicksCount;
    private LocalDateTime createdAt;
    private Boolean isFavorite;
}