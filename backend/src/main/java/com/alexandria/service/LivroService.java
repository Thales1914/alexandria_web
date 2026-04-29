package com.alexandria.service;

import com.alexandria.dto.LivroResponse;
import com.alexandria.model.Livro;
import com.alexandria.repository.LivroRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LivroService {

    private final GoogleBooksService googleBooksService;
    private final LivroRepository livroRepository;
    private final LivroMapper livroMapper;

    public LivroService(
            GoogleBooksService googleBooksService,
            LivroRepository livroRepository,
            LivroMapper livroMapper) {
        this.googleBooksService = googleBooksService;
        this.livroRepository = livroRepository;
        this.livroMapper = livroMapper;
    }

    public List<LivroResponse> buscarLivros(String termo) {
        return googleBooksService.buscarLivros(termo);
    }

    public List<LivroResponse> buscarLivros(
            String termo,
            String categoria,
            String ordem,
            String qualidade,
            int inicio,
            int limite) {
        return googleBooksService.buscarLivros(termo, categoria, ordem, qualidade, inicio, limite);
    }

    public LivroResponse buscarDetalheGoogle(String googleBookId) {
        return googleBooksService.buscarDetalhe(googleBookId);
    }

    @Transactional
    public Livro buscarOuSalvarPorGoogleId(String googleBookId) {
        return livroRepository.findByIdentificadorExterno(googleBookId)
                .orElseGet(() -> {
                    LivroResponse googleBook = googleBooksService.buscarDetalhe(googleBookId);
                    Livro livro = livroMapper.toEntity(googleBook);
                    return livroRepository.save(livro);
                });
    }
}
