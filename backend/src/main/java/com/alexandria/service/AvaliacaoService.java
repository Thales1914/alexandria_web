package com.alexandria.service;

import com.alexandria.dto.AvaliacaoRequest;
import com.alexandria.dto.AvaliacaoResponse;
import com.alexandria.exception.DuplicateResourceException;
import com.alexandria.exception.ResourceNotFoundException;
import com.alexandria.model.Avaliacao;
import com.alexandria.model.Livro;
import com.alexandria.model.User;
import com.alexandria.repository.AvaliacaoRepository;
import com.alexandria.repository.LivroRepository;
import com.alexandria.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UserRepository userRepository;
    private final LivroRepository livroRepository;

    public AvaliacaoService(
            AvaliacaoRepository avaliacaoRepository,
            UserRepository userRepository,
            LivroRepository livroRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.userRepository = userRepository;
        this.livroRepository = livroRepository;
    }

    @Transactional
    public AvaliacaoResponse criarAvaliacao(AvaliacaoRequest request) {
        User usuario = userRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        Livro livro = livroRepository.findById(request.livroId())
                .orElseThrow(() -> new ResourceNotFoundException("Livro nao encontrado"));

        if (avaliacaoRepository.existsByUsuarioIdAndLivroId(usuario.getId(), livro.getId())) {
            throw new DuplicateResourceException("Este usuario ja avaliou este livro");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setLivro(livro);
        avaliacao.setNota(request.nota());
        avaliacao.setResenha(normalizeResenha(request.resenha()));

        return toResponse(avaliacaoRepository.save(avaliacao));
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarPorUsuario(Long usuarioId) {
        if (!userRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario nao encontrado");
        }

        return avaliacaoRepository.findByUsuarioIdOrderByDataAvaliacaoDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalizeResenha(String value) {
        return value == null ? null : value.trim();
    }

    private AvaliacaoResponse toResponse(Avaliacao avaliacao) {
        return new AvaliacaoResponse(
                avaliacao.getId(),
                avaliacao.getUsuario().getId(),
                avaliacao.getLivro().getId(),
                avaliacao.getNota(),
                avaliacao.getResenha(),
                avaliacao.getDataAvaliacao());
    }
}
