package com.alexandria.controller;

import com.alexandria.dto.LivroResponse;
import com.alexandria.service.LivroService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping("/buscar")
    public List<LivroResponse> buscarLivros(
            @RequestParam("termo") @NotBlank(message = "O termo de busca e obrigatorio") String termo,
            @RequestParam(value = "categoria", defaultValue = "Todos") String categoria,
            @RequestParam(value = "ordem", defaultValue = "relevance") String ordem,
            @RequestParam(value = "qualidade", defaultValue = "precise") String qualidade,
            @RequestParam(value = "inicio", defaultValue = "0") @Min(0) int inicio,
            @RequestParam(value = "limite", defaultValue = "20") @Min(1) @Max(40) int limite) {
        return livroService.buscarLivros(termo, categoria, ordem, qualidade, inicio, limite);
    }

    @GetMapping("/google/{id}")
    public LivroResponse buscarDetalheGoogle(@PathVariable String id) {
        return livroService.buscarDetalheGoogle(id);
    }
}
