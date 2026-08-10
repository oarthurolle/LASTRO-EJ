package br.com.lastro.storage.model;

public record StoredImage(
        String key,
        String url,
        String contentType,
        long size
) {
}
