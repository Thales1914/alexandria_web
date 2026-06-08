package com.alexandria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gamificacao", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gamificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private User usuario;

    @Column(name = "xp", nullable = false)
    private int xp;

    @Column(name = "conquistas_desbloqueadas", nullable = false, columnDefinition = "TEXT")
    private String conquistasDesbloqueadas = "[]";

    @Column(name = "historico", nullable = false, columnDefinition = "TEXT")
    private String historico = "[]";

    @Column(name = "total_livros", nullable = false)
    private int totalLivros;

    @Column(name = "livros_lidos", nullable = false)
    private int livrosLidos;

    @Column(name = "avaliacoes", nullable = false)
    private int avaliacoes;

    @Column(name = "favoritos", nullable = false)
    private int favoritos;

    @Column(name = "posts", nullable = false)
    private int posts;

    @Column(name = "abandonados", nullable = false)
    private int abandonados;

    @Column(name = "quero_ler", nullable = false)
    private int queroLer;

    @Column(name = "lendo", nullable = false)
    private int lendo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
