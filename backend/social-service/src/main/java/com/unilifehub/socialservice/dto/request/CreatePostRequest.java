package com.unilifehub.socialservice.dto.request;

import com.unilifehub.socialservice.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Le contenu ne peut pas être vide")
    private String content;

    @NotNull(message = "La visibilité est obligatoire")
    private Post.Visibility visibility;

    private Long groupId; // optionnel

    private String userName;    // ✅ AJOUTER
    private String userAvatar;  // ✅ AJOUTER
}