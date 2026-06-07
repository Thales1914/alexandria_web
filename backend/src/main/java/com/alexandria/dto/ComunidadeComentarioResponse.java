package com.alexandria.dto;

import java.time.LocalDateTime;

public record ComunidadeComentarioResponse(
        Long id,
        Long authorId,
        String authorName,
        String authorEmail,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean ownedByMe
) {
}
