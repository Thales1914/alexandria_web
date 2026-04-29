package com.alexandria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "livros", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "autor", length = 500)
    private String autor;

    @Column(name = "descricao", length = 5000)
    private String descricao;

    @Column(name = "capa", length = 1000)
    private String capa;

    @Column(name = "identificador_externo", nullable = false, unique = true, length = 255)
    private String identificadorExterno;

    @Column(name = "editora", length = 255)
    private String editora;

    @Column(name = "data_publicacao", length = 50)
    private String dataPublicacao;

    @Column(name = "categoria", length = 255)
    private String categoria;

    @Column(name = "numero_paginas")
    private Integer numeroPaginas;

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
