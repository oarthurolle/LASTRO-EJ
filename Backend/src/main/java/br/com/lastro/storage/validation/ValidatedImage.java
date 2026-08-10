package br.com.lastro.storage.validation;

public record ValidatedImage(String contentType, String extension, int width, int height) {
}
