package com.unilife.review.model;

import java.time.LocalDateTime;

/**
 * Reponse admin a un avis — document imbrique dans Review.
 * SOLID - S : represente uniquement la reponse admin.
 */
public class AdminResponse {
    private String adminId;
    private String response;
    private LocalDateTime respondedAt;

    public AdminResponse() {}

    public AdminResponse(String adminId, String response) {
        this.adminId = adminId;
        this.response = response;
        this.respondedAt = LocalDateTime.now();
    }

    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}