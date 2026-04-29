package com.alexandria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "avaliacoes",
        schema = "public",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_avaliacao_usuario_livro",
                columnNames = {"usuario_id", "livro_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Column(name = "nota", nullable = false)
    private Integer nota;

    @Column(name = "resenha", length = 5000)
    private String resenha;

    @Column(name = "data_avaliacao", nullable = false)
    private LocalDateTime dataAvaliacao;

    @PrePersist
    protected void onCreate() {
        dataAvaliacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAvaliacao = LocalDateTime.now();
    }
}
