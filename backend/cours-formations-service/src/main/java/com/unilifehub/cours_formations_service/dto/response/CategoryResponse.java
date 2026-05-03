package com.unilifehub.cours_formations_service.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {
    private Integer id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private Integer parentCategoryId;
    private String parentCategoryName;
    private Integer coursesCount;
    private Integer formationsCount;
    private List<CategoryResponse> subCategories;
}