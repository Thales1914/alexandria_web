package com.alexandria.repository;

import com.alexandria.model.Biblioteca;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {
    List<Biblioteca> findByUsuarioIdOrderByDataAdicaoDesc(Long usuarioId);
    List<Biblioteca> findByUsuarioEmailOrderByDataAdicaoDesc(String email);
    Optional<Biblioteca> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
    Optional<Biblioteca> findByIdAndUsuarioEmail(Long id, String email);
    boolean existsByUsuarioIdAndLivroId(Long usuarioId, Long livroId);
}
