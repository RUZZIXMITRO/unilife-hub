package com.unilifehub.socialservice.config;

import org.springframework.security.core.Authentication;

public final class AuthUtils {

    private AuthUtils() {
    }

    public static Long getRequiredUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Utilisateur non authentifié");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof Number number) {
            return number.longValue();
        }

        throw new SecurityException("Principal JWT invalide");
    }
}
