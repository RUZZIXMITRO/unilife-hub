package com.unilifehub.socialservice.config;

import org.springframework.security.core.Authentication;

public final class AuthUtils {

    private AuthUtils() {
    }

    /**
     * Récupère l'UUID (String) de l'utilisateur authentifié depuis le principal.
     */
    public static String getRequiredUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Utilisateur non authentifié");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof String userId && !userId.isEmpty()) {
            return userId;
        }

        throw new SecurityException("Principal JWT invalide (attendu String UUID)");
    }
}