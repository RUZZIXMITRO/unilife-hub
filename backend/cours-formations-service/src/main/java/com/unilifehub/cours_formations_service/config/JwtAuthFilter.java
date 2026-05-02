package com.unilifehub.cours_formations_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");
        String authorization = request.getHeader("Authorization");

        if ((userId == null || userId.isBlank()) && authorization != null && authorization.startsWith("Bearer ")) {
            String[] parts = authorization.substring(7).split("\\.");
            if (parts.length >= 2) {
                try {
                    String payloadJson = new String(
                            Base64.getUrlDecoder().decode(parts[1]),
                            StandardCharsets.UTF_8
                    );
                    String sub = extractJsonField(payloadJson, "sub");
                    String nameId = extractJsonField(payloadJson, "nameid");
                    String roleFromToken = extractJsonField(payloadJson, "http://schemas.microsoft.com/ws/2008/06/identity/claims/role");
                    if (roleFromToken == null || roleFromToken.isBlank()) {
                        roleFromToken = extractJsonField(payloadJson, "role");
                    }

                    userId = (sub != null && !sub.isBlank()) ? sub : nameId;
                    if ((userRole == null || userRole.isBlank()) && roleFromToken != null) {
                        userRole = roleFromToken;
                    }
                } catch (Exception ignored) {
                }
            }
        }

        if (userId != null && !userId.isBlank() &&
                SecurityContextHolder.getContext().getAuthentication() == null) {
            List<GrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" +
                            (userRole != null ? userRole.toUpperCase() : "STUDENT"))
            );
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJsonField(String json, String field) {
        Pattern p = Pattern.compile("\"" + Pattern.quote(field) + "\"\\s*:\\s*\"([^\"]+)\"");
        Matcher m = p.matcher(json);
        return m.find() ? m.group(1) : null;
    }
}