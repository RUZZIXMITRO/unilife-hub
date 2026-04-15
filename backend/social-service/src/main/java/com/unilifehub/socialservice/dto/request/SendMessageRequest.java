package com.unilifehub.socialservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotNull(message = "Le destinataire est obligatoire")
    private Long receiverId;

    @NotBlank(message = "Le message ne peut pas être vide")
    private String content;
}