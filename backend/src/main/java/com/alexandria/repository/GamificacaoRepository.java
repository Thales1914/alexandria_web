package com.alexandria.repository;

import com.alexandria.model.Gamificacao;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GamificacaoRepository extends JpaRepository<Gamificacao, Long> {
    Optional<Gamificacao> findByUsuarioEmail(String email);
}
