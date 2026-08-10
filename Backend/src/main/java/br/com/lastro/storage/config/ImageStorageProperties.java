package br.com.lastro.storage.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.convert.DataSizeUnit;
import org.springframework.util.unit.DataSize;
import org.springframework.util.unit.DataUnit;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.nio.file.Path;
import java.time.Duration;

@Data
@Validated
@ConfigurationProperties(prefix = "app.storage")
public class ImageStorageProperties {

    @NotNull
    private Path root = Path.of("./uploads");

    @NotBlank
    private String publicBaseUrl = "http://localhost:8080";

    @NotNull
    @DataSizeUnit(DataUnit.MEGABYTES)
    private DataSize maxFileSize = DataSize.ofMegabytes(5);

    @Min(1)
    @Max(10000)
    private int maxWidth = 10000;

    @Min(1)
    @Max(10000)
    private int maxHeight = 10000;

    @Min(1)
    private long maxPixels = 40_000_000L;

    private boolean cleanupEnabled = true;

    @NotNull
    private Duration cleanupGracePeriod = Duration.ofHours(24);

    @Min(60000)
    private long cleanupDelayMs = 86_400_000L;

    public Path normalizedRoot() {
        return root.toAbsolutePath().normalize();
    }

    public String normalizedPublicBaseUrl() {
        String normalized = publicBaseUrl.trim().replaceAll("/+$", "");
        URI uri;
        try {
            uri = URI.create(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("app.storage.public-base-url deve ser uma URL HTTP ou HTTPS valida.", ex);
        }
        if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                || uri.getHost() == null) {
            throw new IllegalStateException("app.storage.public-base-url deve ser uma URL HTTP ou HTTPS valida.");
        }
        return normalized;
    }
}
