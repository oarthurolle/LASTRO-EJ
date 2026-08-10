package br.com.lastro.storage.local;

import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.storage.ImageStorage;
import br.com.lastro.storage.config.ImageStorageProperties;
import br.com.lastro.storage.model.ImagePurpose;
import br.com.lastro.storage.model.ManagedImage;
import br.com.lastro.storage.model.StoredImage;
import br.com.lastro.storage.validation.ImageValidator;
import br.com.lastro.storage.validation.ValidatedImage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.FileTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocalImageStorage implements ImageStorage {

    private static final int BUFFER_SIZE = 8192;

    private final ImageStorageProperties properties;
    private final ImageValidator validator;
    private Path root;
    private String publicBaseUrl;

    @PostConstruct
    void initialize() {
        root = properties.normalizedRoot();
        publicBaseUrl = properties.normalizedPublicBaseUrl();
        try {
            Files.createDirectories(root);
            for (ImagePurpose purpose : ImagePurpose.values()) {
                Files.createDirectories(resolveSafe(purpose.directory()));
            }
            if (!Files.isDirectory(root) || !Files.isWritable(root)) {
                throw new IllegalStateException("O diretorio de uploads nao permite escrita.");
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel inicializar o diretorio de uploads.", ex);
        }
    }

    @Override
    public StoredImage store(MultipartFile file, ImagePurpose purpose) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selecione uma imagem para enviar.");
        }
        if (file.getSize() > properties.getMaxFileSize().toBytes()) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve possuir no maximo 5 MB.");
        }

        Path temporary = null;
        try {
            temporary = Files.createTempFile(root, ".upload-", ".tmp");
            long copied = copyWithLimit(file, temporary, properties.getMaxFileSize().toBytes());
            ValidatedImage validated = validator.validate(temporary, copied);

            String filename = UUID.randomUUID() + "." + validated.extension();
            String key = purpose.directory() + "/" + filename;
            Path destination = resolveSafe(key);
            moveAtomically(temporary, destination);
            temporary = null;

            log.info("Imagem armazenada: finalidade={}, chave={}, tipo={}, tamanho={}",
                    purpose, key, validated.contentType(), copied);
            return new StoredImage(key, publicUrl(key), validated.contentType(), copied);
        } catch (ApiException ex) {
            throw ex;
        } catch (IOException ex) {
            log.error("Falha de I/O ao armazenar imagem para {}", purpose, ex);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Nao foi possivel armazenar a imagem.");
        } finally {
            if (temporary != null) {
                try {
                    Files.deleteIfExists(temporary);
                } catch (IOException ex) {
                    log.warn("Nao foi possivel remover arquivo temporario de upload.");
                }
            }
        }
    }

    @Override
    public List<ManagedImage> listManagedImages() {
        List<ManagedImage> images = new ArrayList<>();
        try {
            for (ImagePurpose purpose : ImagePurpose.values()) {
                Path directory = resolveSafe(purpose.directory());
                try (Stream<Path> paths = Files.list(directory)) {
                    paths.filter(Files::isRegularFile).forEach(path -> {
                        try {
                            String key = root.relativize(path.toAbsolutePath().normalize())
                                    .toString().replace('\\', '/');
                            FileTime modified = Files.getLastModifiedTime(path);
                            images.add(new ManagedImage(key, modified.toInstant()));
                        } catch (IOException ex) {
                            log.warn("Nao foi possivel inspecionar um arquivo gerenciado.");
                        }
                    });
                }
            }
            return List.copyOf(images);
        } catch (IOException ex) {
            log.error("Falha ao listar imagens gerenciadas.", ex);
            return List.of();
        }
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(resolveSafe(key));
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel excluir a imagem gerenciada.", ex);
        }
    }

    @Override
    public String publicUrl(String key) {
        String normalizedKey = normalizeKey(key);
        return publicBaseUrl + "/media/" + normalizedKey;
    }

    @Override
    public String keyFromPublicUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String path;
        try {
            URI uri = URI.create(url.trim());
            if (!uri.isAbsolute() || uri.getHost() == null) {
                return null;
            }
            path = uri.getPath();
        } catch (IllegalArgumentException ex) {
            return null;
        }

        String mediaPrefix = "/media/";
        int mediaIndex = path.lastIndexOf(mediaPrefix);
        if (mediaIndex < 0) {
            return null;
        }
        String key = path.substring(mediaIndex + mediaPrefix.length());
        try {
            Path resolved = resolveSafe(key);
            String normalized = root.relativize(resolved).toString().replace('\\', '/');
            boolean allowed = Stream.of(ImagePurpose.values())
                    .anyMatch(purpose -> normalized.startsWith(purpose.directory() + "/"));
            return allowed ? normalized : null;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    public Path root() {
        return root;
    }

    private long copyWithLimit(MultipartFile file, Path destination, long limit) throws IOException {
        long total = 0;
        byte[] buffer = new byte[BUFFER_SIZE];
        try (InputStream input = file.getInputStream();
             OutputStream output = Files.newOutputStream(destination, StandardOpenOption.TRUNCATE_EXISTING)) {
            int read;
            while ((read = input.read(buffer)) != -1) {
                total += read;
                if (total > limit) {
                    throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve possuir no maximo 5 MB.");
                }
                output.write(buffer, 0, read);
            }
        }
        return total;
    }

    private void moveAtomically(Path source, Path destination) throws IOException {
        try {
            Files.move(source, destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            Files.move(source, destination);
        }
    }

    private Path resolveSafe(String key) {
        Path resolved = root.resolve(normalizeKey(key)).normalize().toAbsolutePath();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Caminho de imagem invalido.");
        }
        return resolved;
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank() || key.contains("\\")) {
            throw new IllegalArgumentException("Chave de imagem invalida.");
        }
        return key.replaceAll("^/+", "");
    }
}
