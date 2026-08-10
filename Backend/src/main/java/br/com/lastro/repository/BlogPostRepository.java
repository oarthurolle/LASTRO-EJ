package br.com.lastro.repository;

import br.com.lastro.entity.BlogPost;
import br.com.lastro.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlugAndStatus(String slug, PostStatus status);

    @Query("SELECT b FROM BlogPost b WHERE b.status = :status " +
           "AND (:category = '' OR b.category = :category) " +
           "AND (:search = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.summary) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<BlogPost> findPublicPosts(
            @Param("status") PostStatus status,
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable
    );

    boolean existsBySlug(String slug);

    @Query("SELECT b.coverImageUrl FROM BlogPost b WHERE b.coverImageUrl IS NOT NULL")
    List<String> findAllReferencedCoverImageUrls();
}
