package com.alexandria.controller;

import com.alexandria.dto.AvaliacaoRequest;
import com.alexandria.dto.AvaliacaoResponse;
import com.alexandria.service.AvaliacaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> criarAvaliacao(
            Authentication authentication,
            @Valid @RequestBody AvaliacaoRequest request) {
        AvaliacaoResponse response = avaliacaoService.criarAvaliacao(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/minhas")
    public List<AvaliacaoResponse> listarMinhasAvaliacoes(Authentication authentication) {
        return avaliacaoService.listarMinhasAvaliacoes(authentication.getName());
    }

    @GetMapping("/usuario/{id}")
    public List<AvaliacaoResponse> listarPorUsuario(Authentication authentication, @PathVariable Long id) {
        return avaliacaoService.listarPorUsuario(authentication.getName(), id);
    }

    @PutMapping("/{id}")
    public AvaliacaoResponse atualizarAvaliacao(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AvaliacaoRequest request) {
        return avaliacaoService.atualizarAvaliacao(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirAvaliacao(Authentication authentication, @PathVariable Long id) {
        avaliacaoService.excluirAvaliacao(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
