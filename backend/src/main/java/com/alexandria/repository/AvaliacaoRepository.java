package com.alexandria.repository;

import com.alexandria.model.Avaliacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByUsuarioIdOrderByDataAvaliacaoDesc(Long usuarioId);
    Optional<Avaliacao> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
    boolean existsByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
}
