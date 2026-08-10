package br.com.lastro.repository;

import br.com.lastro.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {

    List<Partner> findAllByActiveTrueOrderBySortOrderAscIdAsc();

    List<Partner> findAllByOrderBySortOrderAscIdAsc();

    @Query("SELECT p.logoUrl FROM Partner p WHERE p.logoUrl IS NOT NULL")
    List<String> findAllReferencedLogoUrls();
}
