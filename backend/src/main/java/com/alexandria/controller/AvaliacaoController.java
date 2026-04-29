package com.alexandria.controller;

import com.alexandria.dto.AvaliacaoRequest;
import com.alexandria.dto.AvaliacaoResponse;
import com.alexandria.service.AvaliacaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
            @Valid @RequestBody AvaliacaoRequest request) {
        AvaliacaoResponse response = avaliacaoService.criarAvaliacao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/usuario/{id}")
    public List<AvaliacaoResponse> listarPorUsuario(@PathVariable Long id) {
        return avaliacaoService.listarPorUsuario(id);
    }
}
