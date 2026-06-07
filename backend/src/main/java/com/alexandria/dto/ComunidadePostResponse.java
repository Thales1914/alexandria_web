package com.alexandria.dto;

import java.time.LocalDateTime;

public record ComunidadePostResponse(
        Long id,
        Long authorId,
        String authorName,
        String authorEmail,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long likes,
        boolean likedByMe,
        boolean ownedByMe
) {
}
