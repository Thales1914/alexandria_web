package com.alexandria.service;

import com.alexandria.dto.BibliotecaRequest;
import com.alexandria.dto.BibliotecaResponse;
import com.alexandria.dto.FavoritoRequest;
import com.alexandria.dto.StatusLeituraRequest;
import com.alexandria.exception.DuplicateResourceException;
import com.alexandria.exception.InvalidCredentialsException;
import com.alexandria.exception.ResourceNotFoundException;
import com.alexandria.model.Biblioteca;
import com.alexandria.model.Livro;
import com.alexandria.model.StatusLeitura;
import com.alexandria.model.User;
import com.alexandria.repository.BibliotecaRepository;
import com.alexandria.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BibliotecaService {

    private final BibliotecaRepository bibliotecaRepository;
    private final UserRepository userRepository;
    private final LivroService livroService;
    private final LivroMapper livroMapper;

    public BibliotecaService(
            BibliotecaRepository bibliotecaRepository,
            UserRepository userRepository,
            LivroService livroService,
            LivroMapper livroMapper) {
        this.bibliotecaRepository = bibliotecaRepository;
        this.userRepository = userRepository;
        this.livroService = livroService;
        this.livroMapper = livroMapper;
    }

    @Transactional
    public BibliotecaResponse salvarNaBiblioteca(String authenticatedEmail, BibliotecaRequest request) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        Livro livro = livroService.buscarOuSalvarPorGoogleId(request.googleBookId());

        if (bibliotecaRepository.existsByUsuarioIdAndLivroId(usuario.getId(), livro.getId())) {
            throw new DuplicateResourceException("Este livro já está na biblioteca do usuário");
        }

        Biblioteca biblioteca = new Biblioteca();
        biblioteca.setUsuario(usuario);
        biblioteca.setLivro(livro);
        biblioteca.setStatusLeitura(
                request.statusLeitura() == null ? StatusLeitura.QUERO_LER : request.statusLeitura());

        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    @Transactional(readOnly = true)
    public List<BibliotecaResponse> listarMinhaBiblioteca(String authenticatedEmail) {
        getAuthenticatedUser(authenticatedEmail);
        return bibliotecaRepository.findByUsuarioEmailOrderByDataAdicaoDesc(authenticatedEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BibliotecaResponse> listarPorUsuario(String authenticatedEmail, Long usuarioId) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        if (!usuario.getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        return bibliotecaRepository.findByUsuarioIdOrderByDataAdicaoDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BibliotecaResponse atualizarStatus(
            String authenticatedEmail,
            Long bibliotecaId,
            StatusLeituraRequest request) {
        Biblioteca biblioteca = findOwnedBiblioteca(authenticatedEmail, bibliotecaId);
        biblioteca.setStatusLeitura(request.statusLeitura());
        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    @Transactional
    public BibliotecaResponse atualizarFavorito(
            String authenticatedEmail,
            Long bibliotecaId,
            FavoritoRequest request) {
        Biblioteca biblioteca = findOwnedBiblioteca(authenticatedEmail, bibliotecaId);
        biblioteca.setFavorito(request.favorito());
        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    @Transactional
    public void removerDaBiblioteca(String authenticatedEmail, Long bibliotecaId) {
        Biblioteca biblioteca = findOwnedBiblioteca(authenticatedEmail, bibliotecaId);
        bibliotecaRepository.delete(biblioteca);
    }

    private User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Usuário autenticado não encontrado"));
    }

    private Biblioteca findOwnedBiblioteca(String authenticatedEmail, Long bibliotecaId) {
        return bibliotecaRepository.findByIdAndUsuarioEmail(bibliotecaId, authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de biblioteca não encontrado"));
    }

    private BibliotecaResponse toResponse(Biblioteca biblioteca) {
        return new BibliotecaResponse(
                biblioteca.getId(),
                livroMapper.toResponse(biblioteca.getLivro()),
                biblioteca.getStatusLeitura(),
                biblioteca.isFavorito(),
                biblioteca.getDataAdicao());
    }
}
