package com.alexandria.service;

import com.alexandria.dto.BibliotecaRequest;
import com.alexandria.dto.BibliotecaResponse;
import com.alexandria.dto.FavoritoRequest;
import com.alexandria.dto.StatusLeituraRequest;
import com.alexandria.exception.DuplicateResourceException;
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
    public BibliotecaResponse salvarNaBiblioteca(BibliotecaRequest request) {
        User usuario = userRepository.findById(request.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado"));
        Livro livro = livroService.buscarOuSalvarPorGoogleId(request.googleBookId());

        if (bibliotecaRepository.existsByUsuarioIdAndLivroId(usuario.getId(), livro.getId())) {
            throw new DuplicateResourceException("Este livro ja esta na biblioteca do usuario");
        }

        Biblioteca biblioteca = new Biblioteca();
        biblioteca.setUsuario(usuario);
        biblioteca.setLivro(livro);
        biblioteca.setStatusLeitura(
                request.statusLeitura() == null ? StatusLeitura.QUERO_LER : request.statusLeitura());

        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    @Transactional(readOnly = true)
    public List<BibliotecaResponse> listarPorUsuario(Long usuarioId) {
        if (!userRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario nao encontrado");
        }

        return bibliotecaRepository.findByUsuarioIdOrderByDataAdicaoDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BibliotecaResponse atualizarStatus(Long bibliotecaId, StatusLeituraRequest request) {
        Biblioteca biblioteca = findBiblioteca(bibliotecaId);
        biblioteca.setStatusLeitura(request.statusLeitura());
        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    @Transactional
    public BibliotecaResponse atualizarFavorito(Long bibliotecaId, FavoritoRequest request) {
        Biblioteca biblioteca = findBiblioteca(bibliotecaId);
        biblioteca.setFavorito(request.favorito());
        return toResponse(bibliotecaRepository.save(biblioteca));
    }

    private Biblioteca findBiblioteca(Long bibliotecaId) {
        return bibliotecaRepository.findById(bibliotecaId)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de biblioteca nao encontrado"));
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
