package com.alexandria.service;

import com.alexandria.dto.GamificacaoHistoricoItem;
import com.alexandria.dto.GamificacaoStateRequest;
import com.alexandria.dto.GamificacaoStateResponse;
import com.alexandria.dto.GamificacaoStatsDto;
import com.alexandria.exception.InvalidCredentialsException;
import com.alexandria.model.Gamificacao;
import com.alexandria.model.User;
import com.alexandria.repository.GamificacaoRepository;
import com.alexandria.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GamificacaoService {

    private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<GamificacaoHistoricoItem>> HISTORICO_TYPE = new TypeReference<>() {};

    private final GamificacaoRepository gamificacaoRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GamificacaoService(
            GamificacaoRepository gamificacaoRepository,
            UserRepository userRepository) {
        this.gamificacaoRepository = gamificacaoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public GamificacaoStateResponse buscarEstado(String authenticatedEmail) {
        return toResponse(findOrCreate(authenticatedEmail));
    }

    @Transactional
    public GamificacaoStateResponse salvarEstado(String authenticatedEmail, GamificacaoStateRequest request) {
        Gamificacao gamificacao = findOrCreate(authenticatedEmail);
        if (request == null) {
            request = new GamificacaoStateRequest(0, List.of(), List.of(), emptyStats());
        }

        GamificacaoStatsDto stats = request.stats() == null ? emptyStats() : request.stats();

        gamificacao.setXp(nonNegative(request.xp()));
        gamificacao.setConquistasDesbloqueadas(writeJson(limitStrings(request.conquistasDesbloqueadas(), 50)));
        gamificacao.setHistorico(writeJson(limitHistorico(request.historico(), 50)));
        gamificacao.setTotalLivros(nonNegative(stats.totalLivros()));
        gamificacao.setLivrosLidos(nonNegative(stats.livrosLidos()));
        gamificacao.setAvaliacoes(nonNegative(stats.avaliacoes()));
        gamificacao.setFavoritos(nonNegative(stats.favoritos()));
        gamificacao.setPosts(nonNegative(stats.posts()));
        gamificacao.setAbandonados(nonNegative(stats.abandonados()));
        gamificacao.setQueroLer(nonNegative(stats.queroLer()));
        gamificacao.setLendo(nonNegative(stats.lendo()));

        return toResponse(gamificacaoRepository.save(gamificacao));
    }

    private Gamificacao findOrCreate(String authenticatedEmail) {
        return gamificacaoRepository.findByUsuarioEmail(authenticatedEmail)
                .orElseGet(() -> {
                    User usuario = userRepository.findByEmail(authenticatedEmail)
                            .orElseThrow(() -> new InvalidCredentialsException("Usuario autenticado nao encontrado"));

                    Gamificacao gamificacao = new Gamificacao();
                    gamificacao.setUsuario(usuario);
                    return gamificacaoRepository.save(gamificacao);
                });
    }

    private GamificacaoStateResponse toResponse(Gamificacao gamificacao) {
        return new GamificacaoStateResponse(
                gamificacao.getXp(),
                readJson(gamificacao.getConquistasDesbloqueadas(), STRING_LIST_TYPE),
                readJson(gamificacao.getHistorico(), HISTORICO_TYPE),
                new GamificacaoStatsDto(
                        gamificacao.getTotalLivros(),
                        gamificacao.getLivrosLidos(),
                        gamificacao.getAvaliacoes(),
                        gamificacao.getFavoritos(),
                        gamificacao.getPosts(),
                        gamificacao.getAbandonados(),
                        gamificacao.getQueroLer(),
                        gamificacao.getLendo()));
    }

    private GamificacaoStatsDto emptyStats() {
        return new GamificacaoStatsDto(0, 0, 0, 0, 0, 0, 0, 0);
    }

    private int nonNegative(Integer value) {
        return value == null ? 0 : Math.max(0, value);
    }

    private List<String> limitStrings(List<String> values, int limit) {
        if (values == null) return List.of();
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .limit(limit)
                .toList();
    }

    private List<GamificacaoHistoricoItem> limitHistorico(
            List<GamificacaoHistoricoItem> historico,
            int limit) {
        if (historico == null) return List.of();

        return historico.stream()
                .filter(item -> item != null && item.label() != null && item.timestamp() != null)
                .limit(limit)
                .toList();
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException("Nao foi possivel salvar o estado de gamificacao");
        }
    }

    private <T> T readJson(String value, TypeReference<T> type) {
        try {
            return objectMapper.readValue(value == null || value.isBlank() ? "[]" : value, type);
        } catch (JsonProcessingException ex) {
            try {
                return objectMapper.readValue("[]", type);
            } catch (JsonProcessingException ignored) {
                throw new IllegalArgumentException("Nao foi possivel carregar o estado de gamificacao");
            }
        }
    }
}
