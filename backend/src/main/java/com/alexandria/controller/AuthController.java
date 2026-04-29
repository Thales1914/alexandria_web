package com.alexandria.controller;

import com.alexandria.dto.AuthResponse;
import com.alexandria.dto.ForgotPasswordRequest;
import com.alexandria.dto.ForgotPasswordResponse;
import com.alexandria.dto.LoginRequest;
import com.alexandria.dto.MessageResponse;
import com.alexandria.dto.RegisterRequest;
import com.alexandria.dto.ResetPasswordRequest;
import com.alexandria.dto.UpdateProfileRequest;
import com.alexandria.dto.UserProfileResponse;
import com.alexandria.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        UserProfileResponse response = authService.getProfile(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        AuthResponse response = authService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = authService.requestPasswordReset(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }
}
