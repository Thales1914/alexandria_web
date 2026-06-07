package com.alexandria.controller;

import com.alexandria.dto.ComunidadePostRequest;
import com.alexandria.dto.ComunidadePostResponse;
import com.alexandria.service.ComunidadeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comunidade/posts")
public class ComunidadeController {

    private final ComunidadeService comunidadeService;

    public ComunidadeController(ComunidadeService comunidadeService) {
        this.comunidadeService = comunidadeService;
    }

    @GetMapping
    public List<ComunidadePostResponse> listarPosts(Authentication authentication) {
        return comunidadeService.listarPosts(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<ComunidadePostResponse> criarPost(
            Authentication authentication,
            @Valid @RequestBody ComunidadePostRequest request) {
        ComunidadePostResponse response = comunidadeService.criarPost(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/like")
    public ComunidadePostResponse alternarCurtida(Authentication authentication, @PathVariable Long id) {
        return comunidadeService.alternarCurtida(authentication.getName(), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerPost(Authentication authentication, @PathVariable Long id) {
        comunidadeService.removerPost(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
