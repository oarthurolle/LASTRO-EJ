package br.com.lastro.controller;

import br.com.lastro.storage.ImageStorage;
import br.com.lastro.storage.model.ImagePurpose;
import br.com.lastro.storage.model.StoredImage;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminImageUploadControllerTest {

    @Test
    void delegatesBlogAndPartnerToTheirPurposes() {
        ImageStorage storage = mock(ImageStorage.class);
        AdminImageUploadController controller = new AdminImageUploadController(storage);
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1});
        StoredImage blog = new StoredImage("blog/a.png", "https://api/media/blog/a.png", "image/png", 1);
        StoredImage partner = new StoredImage("partners/b.png", "https://api/media/partners/b.png", "image/png", 1);
        when(storage.store(file, ImagePurpose.BLOG)).thenReturn(blog);
        when(storage.store(file, ImagePurpose.PARTNER)).thenReturn(partner);

        var blogResponse = controller.uploadBlogImage(file);
        var partnerResponse = controller.uploadPartnerImage(file);

        assertEquals(201, blogResponse.getStatusCode().value());
        assertEquals(blog.url(), blogResponse.getBody().url());
        assertEquals(201, partnerResponse.getStatusCode().value());
        assertEquals(partner.url(), partnerResponse.getBody().url());
        verify(storage).store(file, ImagePurpose.BLOG);
        verify(storage).store(file, ImagePurpose.PARTNER);
    }
}
