package com.alexandria.service;

import com.alexandria.config.JwtUtil;
import com.alexandria.dto.AuthResponse;
import com.alexandria.dto.ForgotPasswordRequest;
import com.alexandria.dto.ForgotPasswordResponse;
import com.alexandria.dto.LoginRequest;
import com.alexandria.dto.MessageResponse;
import com.alexandria.dto.RegisterRequest;
import com.alexandria.dto.ResetPasswordRequest;
import com.alexandria.dto.UpdateProfileRequest;
import com.alexandria.dto.UserProfileResponse;
import com.alexandria.exception.EmailAlreadyExistsException;
import com.alexandria.exception.InvalidCredentialsException;
import com.alexandria.exception.ResetTokenInvalidException;
import com.alexandria.model.User;
import com.alexandria.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            @Value("${app.frontend.url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Este email ja esta em uso");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setName(request.getName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);

        user = userRepository.save(user);

        return new AuthResponse(jwtUtil.generateToken(user), user.getEmail(), user.getName(), user.getId());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Email ou senha invalidos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Email ou senha invalidos");
        }

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Conta desativada");
        }

        return new AuthResponse(jwtUtil.generateToken(user), user.getEmail(), user.getName(), user.getId());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String authenticatedEmail) {
        User user = getUserByEmail(authenticatedEmail);
        return new UserProfileResponse(user.getId(), user.getName(), user.getEmail());
    }

    @Transactional
    public AuthResponse updateProfile(String authenticatedEmail, UpdateProfileRequest request) {
        User user = getUserByEmail(authenticatedEmail);
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
            throw new EmailAlreadyExistsException("Este email ja esta em uso");
        }

        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user = userRepository.save(user);

        return new AuthResponse(jwtUtil.generateToken(user), user.getEmail(), user.getName(), user.getId());
    }

    @Transactional
    public ForgotPasswordResponse requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            return new ForgotPasswordResponse(
                    "Se o email existir, um link de redefinicao sera enviado.",
                    null,
                    null);
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        return new ForgotPasswordResponse(
                "Link de redefinicao gerado com sucesso.",
                resetToken,
                frontendUrl + "/redefinir-senha?token=" + resetToken);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("As senhas nao coincidem");
        }

        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new ResetTokenInvalidException("Token de redefinicao invalido"));

        if (user.getResetPasswordExpiresAt() == null
                || user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResetTokenInvalidException("Token de redefinicao expirado");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        userRepository.save(user);

        return new MessageResponse("Senha redefinida com sucesso");
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Usuario autenticado nao encontrado"));
    }
}
