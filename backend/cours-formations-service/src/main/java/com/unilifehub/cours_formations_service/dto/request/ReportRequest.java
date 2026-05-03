package com.unilifehub.cours_formations_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequest {

    @NotBlank(message = "La raison est obligatoire")
    private String reason;
}