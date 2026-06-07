package com.alexandria.service;

import com.alexandria.dto.ComunidadePostRequest;
import com.alexandria.dto.ComunidadePostResponse;
import com.alexandria.exception.InvalidCredentialsException;
import com.alexandria.exception.ResourceNotFoundException;
import com.alexandria.model.ComunidadeCurtida;
import com.alexandria.model.ComunidadePost;
import com.alexandria.model.User;
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
    private final UserRepository userRepository;

    public ComunidadeService(
            ComunidadePostRepository postRepository,
            ComunidadeCurtidaRepository curtidaRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.curtidaRepository = curtidaRepository;
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
    public void removerPost(String authenticatedEmail, Long postId) {
        ComunidadePost post = postRepository.findByIdAndUsuarioEmail(postId, authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada"));

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
                ownedByMe);
    }
}
