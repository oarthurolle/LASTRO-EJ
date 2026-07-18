package br.com.lastro.repository;

import br.com.lastro.entity.EmailToken;
import br.com.lastro.entity.EmailTokenType;
import br.com.lastro.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailTokenRepository extends JpaRepository<EmailToken, Long> {
    Optional<EmailToken> findByTokenHashAndType(String tokenHash, EmailTokenType type);
    void deleteAllByUserAndType(User user, EmailTokenType type);
}
