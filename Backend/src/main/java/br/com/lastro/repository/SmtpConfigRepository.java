package br.com.lastro.repository;

import br.com.lastro.entity.SmtpConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SmtpConfigRepository extends JpaRepository<SmtpConfig, Long> {

    Optional<SmtpConfig> findByActiveTrue();

    boolean existsByActiveTrue();

    @Modifying
    @Query("update SmtpConfig c set c.active = false where c.active = true")
    void deactivateAll();
}