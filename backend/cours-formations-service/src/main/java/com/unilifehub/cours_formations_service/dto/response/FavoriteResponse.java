package com.unilifehub.cours_formations_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteResponse {
    private Integer id;
    private Integer resourceId;
    private String resourceType;
    private String title;
    private String description;
    private String categoryName;
}
