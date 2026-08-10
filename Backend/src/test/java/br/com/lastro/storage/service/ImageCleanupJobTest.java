package br.com.lastro.storage.service;

import br.com.lastro.repository.BlogPostRepository;
import br.com.lastro.repository.PartnerRepository;
import br.com.lastro.storage.ImageStorage;
import br.com.lastro.storage.config.ImageStorageProperties;
import br.com.lastro.storage.model.ManagedImage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImageCleanupJobTest {

    @Mock
    ImageStorage imageStorage;
    @Mock
    BlogPostRepository blogPostRepository;
    @Mock
    PartnerRepository partnerRepository;

    @Test
    void removesOnlyOldUnreferencedManagedImages() {
        ImageStorageProperties properties = new ImageStorageProperties();
        properties.setCleanupGracePeriod(Duration.ofHours(24));
        ImageCleanupJob job = new ImageCleanupJob(
                imageStorage, properties, blogPostRepository, partnerRepository
        );

        String referencedUrl = "https://api.test/media/blog/referenced.png";
        when(blogPostRepository.findAllReferencedCoverImageUrls()).thenReturn(List.of(referencedUrl));
        when(partnerRepository.findAllReferencedLogoUrls()).thenReturn(List.of("https://external.test/logo.png"));
        when(imageStorage.keyFromPublicUrl(referencedUrl)).thenReturn("blog/referenced.png");
        when(imageStorage.keyFromPublicUrl("https://external.test/logo.png")).thenReturn(null);
        when(imageStorage.listManagedImages()).thenReturn(List.of(
                new ManagedImage("blog/referenced.png", Instant.now().minus(Duration.ofDays(3))),
                new ManagedImage("blog/orphan.png", Instant.now().minus(Duration.ofDays(3))),
                new ManagedImage("partners/recent.png", Instant.now().minus(Duration.ofHours(2)))
        ));

        job.removeOrphans();

        verify(imageStorage).delete("blog/orphan.png");
        verify(imageStorage, never()).delete("blog/referenced.png");
        verify(imageStorage, never()).delete("partners/recent.png");
    }
}
