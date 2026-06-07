package com.alexandria.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.alexandria.dto.ComunidadeComentarioRequest;
import com.alexandria.dto.ComunidadePostRequest;
import com.alexandria.dto.ComunidadePostResponse;
import com.alexandria.exception.ResourceNotFoundException;
import com.alexandria.model.ComunidadeComentario;
import com.alexandria.model.ComunidadeCurtida;
import com.alexandria.model.ComunidadePost;
import com.alexandria.model.User;
import com.alexandria.repository.ComunidadeComentarioRepository;
import com.alexandria.repository.ComunidadeCurtidaRepository;
import com.alexandria.repository.ComunidadePostRepository;
import com.alexandria.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComunidadeServiceTest {

    @Mock
    private ComunidadePostRepository postRepository;

    @Mock
    private ComunidadeCurtidaRepository curtidaRepository;

    @Mock
    private ComunidadeComentarioRepository comentarioRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ComunidadeService comunidadeService;

    @Test
    void criarPostNormalizaConteudoERetornaAutoria() {
        User user = user(1L, "Ana Leitora", "ana@example.com");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(postRepository.save(any(ComunidadePost.class))).thenAnswer(invocation -> {
            ComunidadePost post = invocation.getArgument(0);
            post.setId(10L);
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(post.getCreatedAt());
            return post;
        });
        when(curtidaRepository.countByPostId(10L)).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUsuarioEmail(10L, user.getEmail())).thenReturn(false);

        ComunidadePostResponse response = comunidadeService.criarPost(
                user.getEmail(),
                new ComunidadePostRequest("  Uma   recomendação de leitura.  "));

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.authorId()).isEqualTo(user.getId());
        assertThat(response.authorName()).isEqualTo(user.getName());
        assertThat(response.content()).isEqualTo("Uma recomendação de leitura.");
        assertThat(response.likes()).isZero();
        assertThat(response.likedByMe()).isFalse();
        assertThat(response.ownedByMe()).isTrue();
        assertThat(response.comments()).isEmpty();
    }

    @Test
    void alternarCurtidaCriaCurtidaQuandoUsuarioAindaNaoCurtiu() {
        User user = user(1L, "Ana Leitora", "ana@example.com");
        ComunidadePost post = post(20L, user, "Livro excelente");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(curtidaRepository.findByPostIdAndUsuarioEmail(post.getId(), user.getEmail()))
                .thenReturn(Optional.empty());
        when(curtidaRepository.countByPostId(post.getId())).thenReturn(1L);
        when(curtidaRepository.existsByPostIdAndUsuarioEmail(post.getId(), user.getEmail())).thenReturn(true);

        ComunidadePostResponse response = comunidadeService.alternarCurtida(user.getEmail(), post.getId());

        verify(curtidaRepository).save(any(ComunidadeCurtida.class));
        assertThat(response.likes()).isEqualTo(1);
        assertThat(response.likedByMe()).isTrue();
    }

    @Test
    void criarComentarioNormalizaConteudoERetornaPostAtualizado() {
        User postAuthor = user(1L, "Ana Leitora", "ana@example.com");
        User commenter = user(2L, "Bia Leitora", "bia@example.com");
        ComunidadePost post = post(20L, postAuthor, "Livro excelente");
        ComunidadeComentario comentario = comentario(5L, post, commenter, "Também gostei muito.");
        when(userRepository.findByEmail(commenter.getEmail())).thenReturn(Optional.of(commenter));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(comentarioRepository.save(any(ComunidadeComentario.class))).thenAnswer(invocation -> {
            ComunidadeComentario saved = invocation.getArgument(0);
            saved.setId(5L);
            saved.setCreatedAt(comentario.getCreatedAt());
            saved.setUpdatedAt(comentario.getUpdatedAt());
            return saved;
        });
        when(curtidaRepository.countByPostId(post.getId())).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUsuarioEmail(post.getId(), commenter.getEmail())).thenReturn(false);
        when(comentarioRepository.findByPostIdOrderByCreatedAtAsc(post.getId()))
                .thenReturn(List.of(comentario));

        ComunidadePostResponse response = comunidadeService.criarComentario(
                commenter.getEmail(),
                post.getId(),
                new ComunidadeComentarioRequest("  Também   gostei muito.  "));

        assertThat(response.comments()).hasSize(1);
        assertThat(response.comments().get(0).content()).isEqualTo("Também gostei muito.");
        assertThat(response.comments().get(0).authorName()).isEqualTo(commenter.getName());
        assertThat(response.comments().get(0).ownedByMe()).isTrue();
    }

    @Test
    void removerComentarioNaoPermiteExcluirComentarioDeOutroUsuario() {
        User postAuthor = user(1L, "Ana Leitora", "ana@example.com");
        User requester = user(2L, "Bia Leitora", "bia@example.com");
        ComunidadePost post = post(20L, postAuthor, "Livro excelente");
        when(userRepository.findByEmail(requester.getEmail())).thenReturn(Optional.of(requester));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(comentarioRepository.findByIdAndPostIdAndUsuarioEmail(99L, post.getId(), requester.getEmail()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> comunidadeService.removerComentario(requester.getEmail(), post.getId(), 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Comentário não encontrado");

        verify(comentarioRepository, never()).delete(any());
    }

    @Test
    void removerPostNaoPermiteExcluirPublicacaoDeOutroUsuario() {
        String email = "ana@example.com";
        when(postRepository.findByIdAndUsuarioEmail(99L, email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> comunidadeService.removerPost(email, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Publicação não encontrada");

        verify(curtidaRepository, never()).deleteByPostId(anyLong());
        verify(comentarioRepository, never()).deleteByPostId(anyLong());
        verify(postRepository, never()).delete(any());
    }

    private User user(Long id, String name, String email) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setPassword("senha");
        user.setEnabled(true);
        return user;
    }

    private ComunidadePost post(Long id, User user, String content) {
        ComunidadePost post = new ComunidadePost();
        post.setId(id);
        post.setUsuario(user);
        post.setConteudo(content);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(post.getCreatedAt());
        return post;
    }

    private ComunidadeComentario comentario(Long id, ComunidadePost post, User user, String content) {
        ComunidadeComentario comentario = new ComunidadeComentario();
        comentario.setId(id);
        comentario.setPost(post);
        comentario.setUsuario(user);
        comentario.setConteudo(content);
        comentario.setCreatedAt(LocalDateTime.now());
        comentario.setUpdatedAt(comentario.getCreatedAt());
        return comentario;
    }
}
