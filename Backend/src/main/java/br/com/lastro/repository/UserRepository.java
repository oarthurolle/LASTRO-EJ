package br.com.lastro.repository;

import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("""
        SELECT u FROM User u
        JOIN u.roles r
        where r.name = :role
    """)
    Set<User> findByRole(
        @Param("role") String role
    );

    List<User> findAllByApprovalStatusOrderByCreatedAtAsc(UserApprovalStatus approvalStatus);
}
