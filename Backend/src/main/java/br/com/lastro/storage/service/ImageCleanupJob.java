package br.com.lastro.storage.service;

import br.com.lastro.repository.BlogPostRepository;
import br.com.lastro.repository.PartnerRepository;
import br.com.lastro.storage.ImageStorage;
import br.com.lastro.storage.config.ImageStorageProperties;
import br.com.lastro.storage.model.ManagedImage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.storage", name = "cleanup-enabled", havingValue = "true", matchIfMissing = true)
public class ImageCleanupJob {

    private final ImageStorage imageStorage;
    private final ImageStorageProperties properties;
    private final BlogPostRepository blogPostRepository;
    private final PartnerRepository partnerRepository;

    @Scheduled(fixedDelayString = "${app.storage.cleanup-delay-ms:86400000}")
    public void removeOrphans() {
        Set<String> referencedKeys = new HashSet<>();
        Stream.concat(
                        blogPostRepository.findAllReferencedCoverImageUrls().stream(),
                        partnerRepository.findAllReferencedLogoUrls().stream()
                )
                .map(imageStorage::keyFromPublicUrl)
                .filter(key -> key != null && !key.isBlank())
                .forEach(referencedKeys::add);

        Instant cutoff = Instant.now().minus(properties.getCleanupGracePeriod());
        int inspected = 0;
        int removed = 0;
        int failed = 0;

        for (ManagedImage image : imageStorage.listManagedImages()) {
            inspected++;
            if (!image.lastModified().isBefore(cutoff) || referencedKeys.contains(image.key())) {
                continue;
            }
            try {
                imageStorage.delete(image.key());
                removed++;
            } catch (RuntimeException ex) {
                failed++;
                log.warn("Falha ao remover imagem orfa: chave={}", image.key());
            }
        }

        log.info("Limpeza de imagens concluida: inspecionadas={}, removidas={}, falhas={}",
                inspected, removed, failed);
    }
}
