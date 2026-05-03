package com.unilifehub.cours_formations_service.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;
    private String icon;
    private String color;
    private Integer parentCategoryId;
}