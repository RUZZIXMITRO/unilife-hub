package com.unilife.review.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AdminResponseRequest {
    @NotBlank
    private String response;

    public AdminResponseRequest() {}
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}