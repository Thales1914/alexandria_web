package com.alexandria.repository;

import com.alexandria.model.Livro;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    Optional<Livro> findByIdentificadorExterno(String identificadorExterno);
    boolean existsByIdentificadorExterno(String identificadorExterno);
}
