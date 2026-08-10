package br.com.lastro.storage.validation;

import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.storage.config.ImageStorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ImageValidator {

    private final ImageStorageProperties properties;

    public ValidatedImage validate(Path path, long size) {
        if (size <= 0) {
            throw invalid("O arquivo de imagem esta vazio.");
        }
        if (size > properties.getMaxFileSize().toBytes()) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve possuir no maximo 5 MB.");
        }

        try (ImageInputStream input = ImageIO.createImageInputStream(Files.newInputStream(path))) {
            if (input == null) {
                throw invalid("O arquivo enviado nao e uma imagem valida.");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw invalid("Formato de imagem nao permitido. Use JPEG, PNG ou WebP.");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                FormatDetails details = formatDetails(format);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                long pixels = Math.multiplyExact((long) width, (long) height);

                if (width <= 0 || height <= 0
                        || width > properties.getMaxWidth()
                        || height > properties.getMaxHeight()
                        || pixels > properties.getMaxPixels()) {
                    throw invalid("As dimensoes da imagem excedem o limite permitido.");
                }

                return new ValidatedImage(details.contentType(), details.extension(), width, height);
            } catch (ArithmeticException ex) {
                throw invalid("As dimensoes da imagem sao invalidas.");
            } finally {
                reader.dispose();
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (IOException | RuntimeException ex) {
            throw invalid("O arquivo enviado esta corrompido ou nao e uma imagem valida.");
        }
    }

    private FormatDetails formatDetails(String format) {
        return switch (format) {
            case "jpeg", "jpg" -> new FormatDetails("image/jpeg", "jpg");
            case "png" -> new FormatDetails("image/png", "png");
            case "webp" -> new FormatDetails("image/webp", "webp");
            default -> throw invalid("Formato de imagem nao permitido. Use JPEG, PNG ou WebP.");
        };
    }

    private ApiException invalid(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    private record FormatDetails(String contentType, String extension) {
    }
}
