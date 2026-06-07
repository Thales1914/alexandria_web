package com.alexandria.repository;

import com.alexandria.model.Avaliacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByUsuarioIdOrderByDataAvaliacaoDesc(Long usuarioId);
    List<Avaliacao> findByUsuarioEmailOrderByDataAvaliacaoDesc(String email);
    Optional<Avaliacao> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
    Optional<Avaliacao> findByIdAndUsuarioEmail(Long id, String email);
    boolean existsByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
}
