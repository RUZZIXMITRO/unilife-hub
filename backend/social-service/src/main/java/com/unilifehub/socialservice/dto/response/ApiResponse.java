package com.unilifehub.socialservice.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    // Réponse succès avec données
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // Réponse succès sans données
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    // Réponse erreur
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}