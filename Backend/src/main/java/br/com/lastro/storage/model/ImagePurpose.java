package br.com.lastro.storage.model;

public enum ImagePurpose {
    BLOG("blog"),
    PARTNER("partners"),
    CASE("cases");

    private final String directory;

    ImagePurpose(String directory) {
        this.directory = directory;
    }

    public String directory() {
        return directory;
    }
}
