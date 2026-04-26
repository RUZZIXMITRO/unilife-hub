package com.unilifehub.socialservice.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // Extraire le userId depuis le token
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        // ASP.NET met l'userId dans le header X-User-Id
        // Le sub contient un UUID credential ID — on retourne 0
        // Le vrai userId vient du header X-User-Id injecté par le frontend
        try {
            String subject = claims.getSubject();
            return Long.parseLong(subject); // si c'est un Long
        } catch (NumberFormatException e) {
            // sub est un UUID → retourner 0, userId viendra du header X-User-Id
            return 0L;
        }
    }

    // Valider le token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expiré");
        } catch (MalformedJwtException e) {
            System.out.println("Token invalide");
        } catch (Exception e) {
            System.out.println("Erreur token: " + e.getMessage());
        }
        return false;
    }

    private Key getSignKey() {
        // AuthService ASP.NET utilise plain text — pas Base64
        byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}