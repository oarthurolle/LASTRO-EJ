package br.com.lastro.storage.local;

import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.storage.config.ImageStorageProperties;
import br.com.lastro.storage.model.ImagePurpose;
import br.com.lastro.storage.validation.ImageValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalImageStorageTest {

    @TempDir
    Path temporaryDirectory;

    private LocalImageStorage storage;

    @BeforeEach
    void setUp() {
        ImageStorageProperties properties = new ImageStorageProperties();
        properties.setRoot(temporaryDirectory.resolve("uploads"));
        properties.setPublicBaseUrl("https://api.lastro.test/");
        storage = new LocalImageStorage(properties, new ImageValidator(properties));
        storage.initialize();
    }

    @Test
    void storesPngWithGeneratedNameAndPublicUrl() throws Exception {
        byte[] png = createImage("png");
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../dangerous-name.png", "image/png", png
        );

        var stored = storage.store(file, ImagePurpose.BLOG);

        assertEquals("image/png", stored.contentType());
        assertTrue(stored.key().matches("blog/[0-9a-f-]{36}\\.png"));
        assertEquals("https://api.lastro.test/media/" + stored.key(), stored.url());
        assertTrue(Files.exists(storage.root().resolve(stored.key())));
        assertFalse(stored.key().contains("dangerous-name"));
        assertEquals(stored.key(), storage.keyFromPublicUrl(stored.url()));
        assertEquals(
                stored.key(),
                storage.keyFromPublicUrl("https://old-api.lastro.test/media/" + stored.key())
        );
        assertNull(storage.keyFromPublicUrl("https://external.test/image.png"));
        assertNull(storage.keyFromPublicUrl("https://external.test/media/../outside.txt"));
    }

    @Test
    void acceptsJpegAndWebp() throws Exception {
        var jpeg = storage.store(new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", createImage("jpg")
        ), ImagePurpose.PARTNER);
        assertEquals("image/jpeg", jpeg.contentType());
        assertTrue(jpeg.key().endsWith(".jpg"));

        byte[] webp = Base64.getDecoder().decode(
                "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA=="
        );
        var storedWebp = storage.store(new MockMultipartFile(
                "file", "pixel.webp", "image/webp", webp
        ), ImagePurpose.BLOG);
        assertEquals("image/webp", storedWebp.contentType());
        assertTrue(storedWebp.key().endsWith(".webp"));
    }

    @Test
    void rejectsFakeImageAndTraversal() {
        MockMultipartFile fake = new MockMultipartFile(
                "file", "fake.png", "image/png", "not-an-image".getBytes(StandardCharsets.UTF_8)
        );

        assertThrows(ApiException.class, () -> storage.store(fake, ImagePurpose.BLOG));
        assertThrows(IllegalArgumentException.class, () -> storage.delete("../outside.txt"));
        assertTrue(storage.listManagedImages().isEmpty());
    }

    @Test
    void listsAndDeletesManagedImage() throws Exception {
        var stored = storage.store(new MockMultipartFile(
                "file", "logo.png", "image/png", createImage("png")
        ), ImagePurpose.PARTNER);

        var managed = storage.listManagedImages();
        assertEquals(1, managed.size());
        assertEquals(stored.key(), managed.getFirst().key());
        assertNotNull(managed.getFirst().lastModified());

        storage.delete(stored.key());
        assertTrue(storage.listManagedImages().isEmpty());
    }

    private byte[] createImage(String format) throws Exception {
        BufferedImage image = new BufferedImage(8, 6, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(image, format, output));
        return output.toByteArray();
    }
}
