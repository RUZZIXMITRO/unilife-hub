package com.unilifehub.cours_formations_service.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private Integer categoryId;

    private String provider;

    @NotBlank(message = "Le lien est obligatoire")
    private String linkUrl;

    private String duration;
    private String level;
    private String language;
    private Boolean isExternal = true;
}