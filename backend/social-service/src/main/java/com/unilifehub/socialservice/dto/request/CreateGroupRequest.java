package com.unilifehub.socialservice.dto.request;

import com.unilifehub.socialservice.entity.StudyGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    private String subject;

    @NotNull(message = "Le type est obligatoire")
    private StudyGroup.GroupType type;
}