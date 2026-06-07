package com.alexandria.controller;

import com.alexandria.dto.BibliotecaRequest;
import com.alexandria.dto.BibliotecaResponse;
import com.alexandria.dto.FavoritoRequest;
import com.alexandria.dto.StatusLeituraRequest;
import com.alexandria.service.BibliotecaService;
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
@RequestMapping("/api/biblioteca")
public class BibliotecaController {

    private final BibliotecaService bibliotecaService;

    public BibliotecaController(BibliotecaService bibliotecaService) {
        this.bibliotecaService = bibliotecaService;
    }

    @PostMapping
    public ResponseEntity<BibliotecaResponse> salvarNaBiblioteca(
            Authentication authentication,
            @Valid @RequestBody BibliotecaRequest request) {
        BibliotecaResponse response = bibliotecaService.salvarNaBiblioteca(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/minha")
    public List<BibliotecaResponse> listarMinhaBiblioteca(Authentication authentication) {
        return bibliotecaService.listarMinhaBiblioteca(authentication.getName());
    }

    @GetMapping("/usuario/{id}")
    public List<BibliotecaResponse> listarPorUsuario(Authentication authentication, @PathVariable Long id) {
        return bibliotecaService.listarPorUsuario(authentication.getName(), id);
    }

    @PutMapping("/{id}/status")
    public BibliotecaResponse atualizarStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody StatusLeituraRequest request) {
        return bibliotecaService.atualizarStatus(authentication.getName(), id, request);
    }

    @PutMapping("/{id}/favorito")
    public BibliotecaResponse atualizarFavorito(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody FavoritoRequest request) {
        return bibliotecaService.atualizarFavorito(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerDaBiblioteca(Authentication authentication, @PathVariable Long id) {
        bibliotecaService.removerDaBiblioteca(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
