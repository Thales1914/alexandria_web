package com.alexandria.service;

import com.alexandria.dto.LivroResponse;
import com.alexandria.model.Livro;
import org.springframework.stereotype.Component;

@Component
public class LivroMapper {

    public LivroResponse toResponse(Livro livro) {
        return new LivroResponse(
                livro.getId(),
                livro.getIdentificadorExterno(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getDescricao(),
                livro.getCapa(),
                livro.getEditora(),
                livro.getDataPublicacao(),
                livro.getCategoria(),
                livro.getNumeroPaginas());
    }

    public Livro toEntity(LivroResponse response) {
        Livro livro = new Livro();
        livro.setIdentificadorExterno(response.identificador());
        livro.setTitulo(response.titulo());
        livro.setAutor(response.autor());
        livro.setDescricao(response.descricao());
        livro.setCapa(response.capa());
        livro.setEditora(response.editora());
        livro.setDataPublicacao(response.dataPublicacao());
        livro.setCategoria(response.categoria());
        livro.setNumeroPaginas(response.numeroPaginas());
        return livro;
    }
}
