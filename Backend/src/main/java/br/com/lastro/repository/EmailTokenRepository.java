package br.com.lastro.repository;

import br.com.lastro.entity.EmailToken;
import br.com.lastro.entity.EmailTokenType;
import br.com.lastro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface EmailTokenRepository extends JpaRepository<EmailToken, Long> {
    Optional<EmailToken> findByTokenHashAndType(String tokenHash, EmailTokenType type);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from EmailToken token where token.tokenHash = :tokenHash and token.type = :type")
    Optional<EmailToken> findByTokenHashAndTypeForUpdate(
            @Param("tokenHash") String tokenHash,
            @Param("type") EmailTokenType type
    );
    void deleteAllByUserAndType(User user, EmailTokenType type);
}
