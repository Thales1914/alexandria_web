package com.alexandria.repository;

import com.alexandria.model.ComunidadePost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunidadePostRepository extends JpaRepository<ComunidadePost, Long> {
    List<ComunidadePost> findAllByOrderByCreatedAtDesc();
    Optional<ComunidadePost> findByIdAndUsuarioEmail(Long id, String email);
    long countByUsuarioEmail(String email);
}
