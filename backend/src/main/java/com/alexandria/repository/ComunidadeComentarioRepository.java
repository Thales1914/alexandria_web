package com.alexandria.repository;

import com.alexandria.model.ComunidadeComentario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunidadeComentarioRepository extends JpaRepository<ComunidadeComentario, Long> {
    List<ComunidadeComentario> findByPostIdOrderByCreatedAtAsc(Long postId);
    Optional<ComunidadeComentario> findByIdAndPostIdAndUsuarioEmail(Long id, Long postId, String email);
    void deleteByPostId(Long postId);
}
