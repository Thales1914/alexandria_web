package com.alexandria.controller;

import com.alexandria.dto.GamificacaoStateRequest;
import com.alexandria.dto.GamificacaoStateResponse;
import com.alexandria.service.GamificacaoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gamificacao")
public class GamificacaoController {

    private final GamificacaoService gamificacaoService;

    public GamificacaoController(GamificacaoService gamificacaoService) {
        this.gamificacaoService = gamificacaoService;
    }

    @GetMapping
    public GamificacaoStateResponse buscarEstado(Authentication authentication) {
        return gamificacaoService.buscarEstado(authentication.getName());
    }

    @PutMapping
    public GamificacaoStateResponse salvarEstado(
            Authentication authentication,
            @RequestBody GamificacaoStateRequest request) {
        return gamificacaoService.salvarEstado(authentication.getName(), request);
    }
}
