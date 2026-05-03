package com.unilifehub.socialservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    private String content;

    private Long parentCommentId; // optionnel (pour les réponses)
}