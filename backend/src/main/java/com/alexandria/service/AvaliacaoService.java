package com.alexandria.service;

import com.alexandria.dto.AvaliacaoRequest;
import com.alexandria.dto.AvaliacaoResponse;
import com.alexandria.exception.DuplicateResourceException;
import com.alexandria.exception.InvalidCredentialsException;
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
    private final LivroService livroService;
    private final LivroMapper livroMapper;

    public AvaliacaoService(
            AvaliacaoRepository avaliacaoRepository,
            UserRepository userRepository,
            LivroRepository livroRepository,
            LivroService livroService,
            LivroMapper livroMapper) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.userRepository = userRepository;
        this.livroRepository = livroRepository;
        this.livroService = livroService;
        this.livroMapper = livroMapper;
    }

    @Transactional
    public AvaliacaoResponse criarAvaliacao(String authenticatedEmail, AvaliacaoRequest request) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        Livro livro = resolveLivro(request);

        if (avaliacaoRepository.existsByUsuarioIdAndLivroId(usuario.getId(), livro.getId())) {
            throw new DuplicateResourceException("Este usuário já avaliou este livro");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setLivro(livro);
        avaliacao.setNota(request.nota());
        avaliacao.setResenha(normalizeResenha(request.resenha()));

        return toResponse(avaliacaoRepository.save(avaliacao));
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarMinhasAvaliacoes(String authenticatedEmail) {
        getAuthenticatedUser(authenticatedEmail);
        return avaliacaoRepository.findByUsuarioEmailOrderByDataAvaliacaoDesc(authenticatedEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarPorUsuario(String authenticatedEmail, Long usuarioId) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        if (!usuario.getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        return avaliacaoRepository.findByUsuarioIdOrderByDataAvaliacaoDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AvaliacaoResponse atualizarAvaliacao(
            String authenticatedEmail,
            Long avaliacaoId,
            AvaliacaoRequest request) {
        Avaliacao avaliacao = findOwnedAvaliacao(authenticatedEmail, avaliacaoId);
        avaliacao.setNota(request.nota());
        avaliacao.setResenha(normalizeResenha(request.resenha()));
        return toResponse(avaliacaoRepository.save(avaliacao));
    }

    @Transactional
    public void excluirAvaliacao(String authenticatedEmail, Long avaliacaoId) {
        Avaliacao avaliacao = findOwnedAvaliacao(authenticatedEmail, avaliacaoId);
        avaliacaoRepository.delete(avaliacao);
    }

    private User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Usuário autenticado não encontrado"));
    }

    private Livro resolveLivro(AvaliacaoRequest request) {
        if (request.livroId() != null) {
            return livroRepository.findById(request.livroId())
                    .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado"));
        }

        String googleBookId = normalizeResenha(request.googleBookId());
        if (googleBookId != null && !googleBookId.isBlank()) {
            return livroService.buscarOuSalvarPorGoogleId(googleBookId);
        }

        throw new IllegalArgumentException("O livro é obrigatório");
    }

    private Avaliacao findOwnedAvaliacao(String authenticatedEmail, Long avaliacaoId) {
        return avaliacaoRepository.findByIdAndUsuarioEmail(avaliacaoId, authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));
    }

    private String normalizeResenha(String value) {
        return value == null ? null : value.trim();
    }

    private AvaliacaoResponse toResponse(Avaliacao avaliacao) {
        return new AvaliacaoResponse(
                avaliacao.getId(),
                avaliacao.getUsuario().getId(),
                avaliacao.getLivro().getId(),
                livroMapper.toResponse(avaliacao.getLivro()),
                avaliacao.getNota(),
                avaliacao.getResenha(),
                avaliacao.getDataAvaliacao());
    }
}
