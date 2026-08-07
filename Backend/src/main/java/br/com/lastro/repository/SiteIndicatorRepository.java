package br.com.lastro.repository;

import br.com.lastro.entity.SiteIndicator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteIndicatorRepository extends JpaRepository<SiteIndicator, Long> {
}
