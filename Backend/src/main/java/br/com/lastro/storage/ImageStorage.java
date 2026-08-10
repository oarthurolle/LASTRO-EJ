package br.com.lastro.storage;

import br.com.lastro.storage.model.ImagePurpose;
import br.com.lastro.storage.model.ManagedImage;
import br.com.lastro.storage.model.StoredImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageStorage {
    StoredImage store(MultipartFile file, ImagePurpose purpose);

    List<ManagedImage> listManagedImages();

    void delete(String key);

    String publicUrl(String key);

    String keyFromPublicUrl(String url);
}
