package com.unilifehub.socialservice.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Extrait l'UUID utilisateur depuis le claim 'sub' du JWT.
     * @return String UUID ou null si non trouvé
     */
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject(); // L'UUID sous forme de String
    }

    /**
     * Extrait le rôle (STUDENT ou ADMIN) depuis le JWT.
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object role = claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
        if (role == null) role = claims.get("role");
        return role != null ? role.toString() : "STUDENT";
    }

    /**
     * Valide le token JWT.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token expiré: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Token malformé: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Erreur validation token: {}", e.getMessage());
        }
        return false;
    }

    private Key getSignKey() {
        byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}