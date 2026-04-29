package com.alexandria.dto;

public record LivroResponse(
        Long id,
        String identificador,
        String titulo,
        String autor,
        String descricao,
        String capa,
        String editora,
        String dataPublicacao,
        String categoria,
        Integer numeroPaginas
) {
}
