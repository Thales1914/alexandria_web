package com.alexandria.repository;

import com.alexandria.model.ComunidadeCurtida;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunidadeCurtidaRepository extends JpaRepository<ComunidadeCurtida, Long> {
    Optional<ComunidadeCurtida> findByPostIdAndUsuarioEmail(Long postId, String email);
    boolean existsByPostIdAndUsuarioEmail(Long postId, String email);
    long countByPostId(Long postId);
    long countByUsuarioEmail(String email);
    void deleteByPostId(Long postId);
}
