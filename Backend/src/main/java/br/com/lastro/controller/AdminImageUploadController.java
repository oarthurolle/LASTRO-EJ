package br.com.lastro.controller;

import br.com.lastro.dto.image.ImageUploadResponseDTO;
import br.com.lastro.storage.ImageStorage;
import br.com.lastro.storage.model.ImagePurpose;
import br.com.lastro.storage.model.StoredImage;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
@RequiredArgsConstructor
@Tag(name = "Administracao - Imagens", description = "Upload administrativo de imagens")
public class AdminImageUploadController {

    private final ImageStorage imageStorage;

    @PostMapping(value = "/blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRIV_BLOG_ADMIN')")
    public ResponseEntity<ImageUploadResponseDTO> uploadBlogImage(
            @RequestParam("file") MultipartFile file
    ) {
        return created(imageStorage.store(file, ImagePurpose.BLOG));
    }

    @PostMapping(value = "/partners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRIV_PARTNERS_ADMIN')")
    public ResponseEntity<ImageUploadResponseDTO> uploadPartnerImage(
            @RequestParam("file") MultipartFile file
    ) {
        return created(imageStorage.store(file, ImagePurpose.PARTNER));
    }

    @PostMapping(value = "/cases", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRIV_CASES_ADMIN')")
    public ResponseEntity<ImageUploadResponseDTO> uploadCaseImage(
            @RequestParam("file") MultipartFile file
    ) {
        return created(imageStorage.store(file, ImagePurpose.CASE));
    }

    private ResponseEntity<ImageUploadResponseDTO> created(StoredImage image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ImageUploadResponseDTO(image.url(), image.contentType(), image.size()));
    }
}
