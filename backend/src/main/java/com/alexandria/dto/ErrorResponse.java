package com.alexandria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private Map<String, String> errors;

    public ErrorResponse(String message) {
        this.message = message;
        this.errors = null;
    }
}
