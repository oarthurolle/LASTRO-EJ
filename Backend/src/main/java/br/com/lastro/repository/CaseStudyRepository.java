package br.com.lastro.repository;

import br.com.lastro.entity.CaseStatus;
import br.com.lastro.entity.CaseStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaseStudyRepository extends JpaRepository<CaseStudy, Long> {

    Optional<CaseStudy> findByIdAndStatus(Long id, CaseStatus status);

    List<CaseStudy> findAllByStatusOrderByProjectDateDescIdDesc(CaseStatus status);

    List<CaseStudy> findAllByStatusOrderByIdDesc(CaseStatus status);
}