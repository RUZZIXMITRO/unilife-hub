package com.unilifehub.socialservice.dto.request;

import com.unilifehub.socialservice.entity.Report;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportRequest {

    @NotNull(message = "L'ID du contenu est obligatoire")
    private Long contentId;

    @NotNull(message = "Le type de contenu est obligatoire")
    private Report.ContentType contentType;

    @NotBlank(message = "La raison est obligatoire")
    private String reason;

    private Long reportedUserId;
}