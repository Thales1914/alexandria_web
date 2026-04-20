package com.alexandria.dto;

public class UserProfileResponse {
    private String name;
    private String email;

    public UserProfileResponse(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() { return name; }
    public String getEmail() { return email; }
}