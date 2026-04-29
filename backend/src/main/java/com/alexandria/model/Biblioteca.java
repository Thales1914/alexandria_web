package com.alexandria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "biblioteca",
        schema = "public",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_biblioteca_usuario_livro",
                columnNames = {"usuario_id", "livro_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Biblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livro_id", nullable = false)
    private Livro livro;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_leitura", nullable = false, length = 30)
    private StatusLeitura statusLeitura = StatusLeitura.QUERO_LER;

    @Column(name = "favorito", nullable = false)
    private boolean favorito = false;

    @Column(name = "data_adicao", nullable = false, updatable = false)
    private LocalDateTime dataAdicao;

    @PrePersist
    protected void onCreate() {
        dataAdicao = LocalDateTime.now();
    }
}
