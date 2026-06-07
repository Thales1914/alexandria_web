package com.alexandria.service;

import com.alexandria.dto.ComunidadeComentarioRequest;
import com.alexandria.dto.ComunidadeComentarioResponse;
import com.alexandria.dto.ComunidadePostRequest;
import com.alexandria.dto.ComunidadePostResponse;
import com.alexandria.exception.InvalidCredentialsException;
import com.alexandria.exception.ResourceNotFoundException;
import com.alexandria.model.ComunidadeComentario;
import com.alexandria.model.ComunidadeCurtida;
import com.alexandria.model.ComunidadePost;
import com.alexandria.model.User;
import com.alexandria.repository.ComunidadeComentarioRepository;
import com.alexandria.repository.ComunidadeCurtidaRepository;
import com.alexandria.repository.ComunidadePostRepository;
import com.alexandria.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComunidadeService {

    private final ComunidadePostRepository postRepository;
    private final ComunidadeCurtidaRepository curtidaRepository;
    private final ComunidadeComentarioRepository comentarioRepository;
    private final UserRepository userRepository;

    public ComunidadeService(
            ComunidadePostRepository postRepository,
            ComunidadeCurtidaRepository curtidaRepository,
            ComunidadeComentarioRepository comentarioRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.curtidaRepository = curtidaRepository;
        this.comentarioRepository = comentarioRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ComunidadePostResponse> listarPosts(String authenticatedEmail) {
        getAuthenticatedUser(authenticatedEmail);

        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> toResponse(post, authenticatedEmail))
                .toList();
    }

    @Transactional
    public ComunidadePostResponse criarPost(String authenticatedEmail, ComunidadePostRequest request) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        String conteudo = normalizeContent(request.content());

        if (conteudo.length() < 5 || conteudo.length() > 1000) {
            throw new IllegalArgumentException("A publicação deve ter entre 5 e 1000 caracteres");
        }

        ComunidadePost post = new ComunidadePost();
        post.setUsuario(usuario);
        post.setConteudo(conteudo);

        return toResponse(postRepository.save(post), authenticatedEmail);
    }

    @Transactional
    public ComunidadePostResponse alternarCurtida(String authenticatedEmail, Long postId) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        ComunidadePost post = findPost(postId);

        curtidaRepository.findByPostIdAndUsuarioEmail(postId, authenticatedEmail)
                .ifPresentOrElse(
                        curtidaRepository::delete,
                        () -> {
                            ComunidadeCurtida curtida = new ComunidadeCurtida();
                            curtida.setUsuario(usuario);
                            curtida.setPost(post);
                            curtidaRepository.save(curtida);
                        });

        return toResponse(post, authenticatedEmail);
    }

    @Transactional
    public ComunidadePostResponse criarComentario(
            String authenticatedEmail,
            Long postId,
            ComunidadeComentarioRequest request) {
        User usuario = getAuthenticatedUser(authenticatedEmail);
        ComunidadePost post = findPost(postId);
        String conteudo = normalizeContent(request.content());

        if (conteudo.length() < 2 || conteudo.length() > 500) {
            throw new IllegalArgumentException("O comentário deve ter entre 2 e 500 caracteres");
        }

        ComunidadeComentario comentario = new ComunidadeComentario();
        comentario.setPost(post);
        comentario.setUsuario(usuario);
        comentario.setConteudo(conteudo);
        comentarioRepository.save(comentario);

        return toResponse(post, authenticatedEmail);
    }

    @Transactional
    public ComunidadePostResponse removerComentario(String authenticatedEmail, Long postId, Long comentarioId) {
        getAuthenticatedUser(authenticatedEmail);
        ComunidadePost post = findPost(postId);
        ComunidadeComentario comentario = comentarioRepository
                .findByIdAndPostIdAndUsuarioEmail(comentarioId, postId, authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Comentário não encontrado"));

        comentarioRepository.delete(comentario);
        return toResponse(post, authenticatedEmail);
    }

    @Transactional
    public void removerPost(String authenticatedEmail, Long postId) {
        ComunidadePost post = postRepository.findByIdAndUsuarioEmail(postId, authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada"));

        comentarioRepository.deleteByPostId(post.getId());
        curtidaRepository.deleteByPostId(post.getId());
        postRepository.delete(post);
    }

    private User getAuthenticatedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Usuário autenticado não encontrado"));
    }

    private ComunidadePost findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada"));
    }

    private String normalizeContent(String value) {
        return value == null ? "" : value.trim().replaceAll("[\\t\\x0B\\f\\r ]+", " ");
    }

    private ComunidadePostResponse toResponse(ComunidadePost post, String authenticatedEmail) {
        String normalizedEmail = authenticatedEmail.toLowerCase();
        boolean ownedByMe = post.getUsuario().getEmail().equalsIgnoreCase(normalizedEmail);

        return new ComunidadePostResponse(
                post.getId(),
                post.getUsuario().getId(),
                post.getUsuario().getName(),
                post.getUsuario().getEmail(),
                post.getConteudo(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                curtidaRepository.countByPostId(post.getId()),
                curtidaRepository.existsByPostIdAndUsuarioEmail(post.getId(), authenticatedEmail),
                ownedByMe,
                comentarioRepository.findByPostIdOrderByCreatedAtAsc(post.getId())
                        .stream()
                        .map(comentario -> toComentarioResponse(comentario, normalizedEmail))
                        .toList());
    }

    private ComunidadeComentarioResponse toComentarioResponse(
            ComunidadeComentario comentario,
            String normalizedEmail) {
        boolean ownedByMe = comentario.getUsuario().getEmail().equalsIgnoreCase(normalizedEmail);

        return new ComunidadeComentarioResponse(
                comentario.getId(),
                comentario.getUsuario().getId(),
                comentario.getUsuario().getName(),
                comentario.getUsuario().getEmail(),
                comentario.getConteudo(),
                comentario.getCreatedAt(),
                comentario.getUpdatedAt(),
                ownedByMe);
    }
}
