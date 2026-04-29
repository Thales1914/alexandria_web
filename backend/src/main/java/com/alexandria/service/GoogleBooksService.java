package com.alexandria.service;

import com.alexandria.dto.LivroResponse;
import com.alexandria.exception.ExternalApiException;
import com.alexandria.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GoogleBooksService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleBooksService.class);
    private static final String DEFAULT_DESCRIPTION = "Descricao nao disponivel.";
    private static final String DEFAULT_COVER = "https://placehold.co/300x460/112240/64ffda?text=Sem+Capa";
    private static final Map<String, String> CATEGORY_SUBJECTS = Map.of(
            "fantasia", "fantasy",
            "romance", "romance",
            "historia", "history",
            "tecnologia", "computers",
            "biografia", "biography",
            "misterio", "mystery");
    private static final Set<String> WEAK_DESCRIPTIONS = Set.of(
            "descricao nao disponivel.",
            "descricao indisponivel.",
            "sem descricao.");
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "as", "o", "os", "e", "de", "da", "do", "das", "dos", "the", "and", "of");
    private static final List<String> SECONDARY_MATERIAL_TERMS = List.of(
            "analysis",
            "analise",
            "companion",
            "critical",
            "critica",
            "criticism",
            "education",
            "essay",
            "essays",
            "guide",
            "handbook",
            "literary criticism",
            "literary collections",
            "perspectives",
            "study guide");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiUrl;
    private final String apiKey;
    private final String language;
    private final String country;

    public GoogleBooksService(
            @Value("${google.books.api-url:https://www.googleapis.com/books/v1/volumes}") String apiUrl,
            @Value("${google.books.api-key:}") String apiKey,
            @Value("${google.books.lang:pt}") String language,
            @Value("${google.books.country:BR}") String country) {
        this.objectMapper = new ObjectMapper();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.language = language;
        this.country = country;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public List<LivroResponse> buscarLivros(String termo) {
        return buscarLivros(termo, "Todos", "relevance", "precise", 0, 20);
    }

    public List<LivroResponse> buscarLivros(
            String termo,
            String categoria,
            String ordem,
            String qualidade,
            int inicio,
            int limite) {
        String normalizedTerm = normalizeTerm(termo);
        if (normalizedTerm.isBlank()) {
            throw new IllegalArgumentException("O termo de busca e obrigatorio");
        }

        int boundedStartIndex = Math.max(inicio, 0);
        int boundedLimit = Math.max(1, Math.min(limite, 40));
        int requestLimit = isFilteredQuality(qualidade) ? Math.min(40, Math.max(boundedLimit, boundedLimit * 2)) : boundedLimit;
        List<LivroResponse> books = new ArrayList<>();

        for (String searchQuery : buildSearchQueries(normalizedTerm, categoria, qualidade)) {
            String url = apiUrl
                    + "?q=" + encode(searchQuery)
                    + "&startIndex=" + boundedStartIndex
                    + "&maxResults=" + requestLimit
                    + "&printType=books"
                    + "&orderBy=" + encode(normalizeOrder(ordem))
                    + "&langRestrict=" + encode(language)
                    + "&country=" + encode(country)
                    + apiKeyParam();

            JsonNode root = executeRequest(url, "Falha ao consultar livros no Google Books");
            for (JsonNode item : root.path("items")) {
                books.add(toLivroResponse(item));
            }
        }

        List<LivroResponse> filteredBooks = filterBooks(books, qualidade, normalizedTerm, ordem, boundedLimit);
        logger.info(
                "Busca Google Books concluida para termo='{}' com {} resultado(s) apos filtros",
                normalizedTerm,
                filteredBooks.size());
        return filteredBooks;
    }

    public LivroResponse buscarDetalhe(String googleBookId) {
        String normalizedId = normalizeTerm(googleBookId);
        if (normalizedId.isBlank()) {
            throw new IllegalArgumentException("O identificador do livro e obrigatorio");
        }

        String url = apiUrl + "/" + encode(normalizedId) + apiKeyParamWithPrefix("?");
        JsonNode root = executeRequest(url, "Nao foi possivel carregar os detalhes do livro");

        if (!root.hasNonNull("id")) {
            throw new ResourceNotFoundException("Livro nao encontrado no Google Books");
        }

        return toLivroResponse(root);
    }

    private JsonNode executeRequest(String url, String fallbackMessage) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(12))
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                throw new ResourceNotFoundException("Livro nao encontrado no Google Books");
            }

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.warn("Google Books retornou status {}: {}", response.statusCode(), response.body());
                throw new ExternalApiException(messageForStatus(response.statusCode(), fallbackMessage));
            }

            return objectMapper.readTree(response.body());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ExternalApiException(fallbackMessage, ex);
        } catch (IOException ex) {
            throw new ExternalApiException(fallbackMessage, ex);
        }
    }

    private LivroResponse toLivroResponse(JsonNode item) {
        JsonNode volumeInfo = item.path("volumeInfo");
        String title = textOrDefault(volumeInfo.path("title"), "Titulo indisponivel");
        String author = firstArrayValues(volumeInfo.path("authors"), "Autor desconhecido");
        String category = firstArrayValues(volumeInfo.path("categories"), "Sem categoria");
        String thumbnail = textOrDefault(volumeInfo.path("imageLinks").path("thumbnail"), DEFAULT_COVER)
                .replace("http://", "https://");

        return new LivroResponse(
                null,
                textOrDefault(item.path("id"), ""),
                title,
                author,
                stripHtml(textOrDefault(volumeInfo.path("description"), DEFAULT_DESCRIPTION)),
                thumbnail,
                textOrDefault(volumeInfo.path("publisher"), "Editora nao informada"),
                textOrDefault(volumeInfo.path("publishedDate"), "Data nao informada"),
                category,
                volumeInfo.path("pageCount").isNumber() ? volumeInfo.path("pageCount").asInt() : null);
    }

    private String firstArrayValues(JsonNode node, String fallback) {
        if (!node.isArray() || node.isEmpty()) {
            return fallback;
        }

        List<String> values = new ArrayList<>();
        node.forEach(value -> {
            String text = value.asText("").trim();
            if (!text.isBlank()) {
                values.add(text);
            }
        });

        return values.isEmpty() ? fallback : String.join(", ", values);
    }

    private String textOrDefault(JsonNode node, String fallback) {
        String value = node.asText("").trim();
        return value.isBlank() ? fallback : value;
    }

    private String stripHtml(String value) {
        return value.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }

    private List<String> buildSearchQueries(String normalizedTerm, String categoria, String qualidade) {
        String baseQuery = buildSearchQuery(normalizedTerm, categoria);
        if (!isPreciseQuality(qualidade) || normalizedTerm.toLowerCase(Locale.ROOT).contains(":")) {
            return List.of(baseQuery);
        }

        List<String> tokens = getQueryTokens(normalizedTerm);
        if (tokens.isEmpty()) {
            return List.of(baseQuery);
        }

        String subject = CATEGORY_SUBJECTS.get(normalizeForComparison(categoria));
        List<String> queries = new ArrayList<>();
        queries.add(appendSubject(toOperatorQuery("intitle", tokens), subject));
        queries.add(appendSubject(toOperatorQuery("inauthor", tokens), subject));
        queries.add(baseQuery);
        return queries;
    }

    private String buildSearchQuery(String normalizedTerm, String categoria) {
        if (normalizedTerm.toLowerCase(Locale.ROOT).contains("subject:")) {
            return normalizedTerm;
        }

        String subject = CATEGORY_SUBJECTS.get(normalizeForComparison(categoria));
        return subject == null ? normalizedTerm : normalizedTerm + " subject:" + subject;
    }

    private String appendSubject(String query, String subject) {
        return subject == null || subject.isBlank() ? query : query + " subject:" + subject;
    }

    private String toOperatorQuery(String operator, List<String> tokens) {
        return tokens.stream()
                .map(token -> operator + ":" + token)
                .reduce((first, second) -> first + " " + second)
                .orElse("");
    }

    private String normalizeOrder(String ordem) {
        return "newest".equalsIgnoreCase(ordem) ? "newest" : "relevance";
    }

    private List<LivroResponse> filterBooks(List<LivroResponse> books, String qualidade, String query, String ordem, int limit) {
        boolean filtered = isFilteredQuality(qualidade);
        Set<String> seen = new HashSet<>();
        List<LivroResponse> filteredBooks = new ArrayList<>();

        for (LivroResponse book : books) {
            String key = normalizeForComparison(book.titulo()) + "|" + normalizeForComparison(book.autor());
            if (!seen.add(key)) {
                continue;
            }

            if (filtered && !isCuratedBook(book, query, qualidade)) {
                continue;
            }

            filteredBooks.add(book);
        }

        if (!"newest".equalsIgnoreCase(ordem)) {
            filteredBooks.sort(Comparator.comparingInt((LivroResponse book) -> getRelevanceScore(book, query)).reversed());
        }

        return filteredBooks.stream().limit(limit).toList();
    }

    private boolean isCuratedBook(LivroResponse book, String query, String qualidade) {
        return hasRealCover(book)
                && hasUsefulDescription(book)
                && hasKnownAuthor(book)
                && !isSecondaryMaterial(book, query)
                && (!isPreciseQuality(qualidade) || hasStrongQueryMatch(book, query));
    }

    private boolean hasRealCover(LivroResponse book) {
        return book.capa() != null
                && !book.capa().isBlank()
                && !DEFAULT_COVER.equals(book.capa())
                && !book.capa().contains("placehold.co");
    }

    private boolean hasUsefulDescription(LivroResponse book) {
        String description = normalizeForComparison(book.descricao());
        return description.length() >= 80 && !WEAK_DESCRIPTIONS.contains(description);
    }

    private boolean hasKnownAuthor(LivroResponse book) {
        return !"autor desconhecido".equals(normalizeForComparison(book.autor()));
    }

    private boolean hasStrongQueryMatch(LivroResponse book, String query) {
        List<String> tokens = getQueryTokens(query);
        if (tokens.isEmpty()) {
            return true;
        }

        String title = normalizeForComparison(book.titulo());
        String author = normalizeForComparison(book.autor());
        String titleAndAuthor = title + " " + author;
        String normalizedQuery = stripSearchOperators(query);

        if (title.contains(normalizedQuery) || author.contains(normalizedQuery)) {
            return true;
        }

        if (tokens.size() == 1) {
            return titleAndAuthor.contains(tokens.get(0));
        }

        return tokens.stream().allMatch(title::contains) || tokens.stream().allMatch(author::contains);
    }

    private boolean isSecondaryMaterial(LivroResponse book, String query) {
        List<String> queryTokens = getQueryTokens(query);
        String searchableText = normalizeForComparison(
                book.titulo() + " " + book.categoria() + " " + book.editora());

        return SECONDARY_MATERIAL_TERMS.stream().anyMatch(term -> {
            String normalizedTerm = normalizeForComparison(term);
            return searchableText.contains(normalizedTerm) && !queryTokens.contains(normalizedTerm);
        });
    }

    private int getRelevanceScore(LivroResponse book, String query) {
        List<String> tokens = getQueryTokens(query);
        String normalizedQuery = stripSearchOperators(query);
        String title = normalizeForComparison(book.titulo());
        String author = normalizeForComparison(book.autor());
        String category = normalizeForComparison(book.categoria());
        int score = 0;

        if (title.equals(normalizedQuery)) {
            score += 120;
        } else if (title.contains(normalizedQuery)) {
            score += 95;
        }

        if (!tokens.isEmpty() && tokens.stream().allMatch(title::contains)) {
            score += 70;
        }

        if (!tokens.isEmpty() && tokens.stream().allMatch(author::contains)) {
            score += 50;
        }

        if (!tokens.isEmpty() && tokens.stream().anyMatch(title::contains)) {
            score += 20;
        }

        if (category.contains("juvenile fiction") || category.contains("fiction")) {
            score += 12;
        }

        if (isSecondaryMaterial(book, query)) {
            score -= 90;
        }

        return score;
    }

    private List<String> getQueryTokens(String query) {
        String normalizedQuery = stripSearchOperators(query);
        if (normalizedQuery.isBlank()) {
            return List.of();
        }

        List<String> tokens = new ArrayList<>();
        for (String token : normalizedQuery.split("\\s+")) {
            if (token.length() > 1 && !STOP_WORDS.contains(token)) {
                tokens.add(token);
            }
        }

        return tokens;
    }

    private String stripSearchOperators(String query) {
        return normalizeForComparison(query).replaceAll("subject:[a-z]+", " ").replaceAll("\\s+", " ").trim();
    }

    private boolean isFilteredQuality(String qualidade) {
        return !"all".equalsIgnoreCase(qualidade);
    }

    private boolean isPreciseQuality(String qualidade) {
        return qualidade == null || qualidade.isBlank() || "precise".equalsIgnoreCase(qualidade);
    }

    private String normalizeForComparison(String value) {
        if (value == null) {
            return "";
        }

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^\\p{L}\\p{N}:\\s]", " ")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);
    }

    private String messageForStatus(int statusCode, String fallbackMessage) {
        if (statusCode == 401 || statusCode == 403) {
            return "Google Books recusou a chave configurada. Verifique GOOGLE_BOOKS_API_KEY no backend.";
        }

        if (statusCode == 429) {
            return "Limite da Google Books API atingido. Configure GOOGLE_BOOKS_API_KEY no backend.";
        }

        return fallbackMessage;
    }

    private String normalizeTerm(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String apiKeyParam() {
        return apiKey == null || apiKey.isBlank() ? "" : "&key=" + encode(apiKey.trim());
    }

    private String apiKeyParamWithPrefix(String prefix) {
        return apiKey == null || apiKey.isBlank() ? "" : prefix + "key=" + encode(apiKey.trim());
    }
}
