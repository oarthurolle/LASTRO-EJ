package br.com.lastro.storage.model;

import java.time.Instant;

public record ManagedImage(String key, Instant lastModified) {
}
