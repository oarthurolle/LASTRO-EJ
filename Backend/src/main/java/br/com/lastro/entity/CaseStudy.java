package br.com.lastro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "case_studies")
public class CaseStudy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_name", nullable = false, length = 255)
    private String clientName;

    @Column(name = "service_category", length = 255)
    private String serviceCategory;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String problem;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String solution;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String result;

    @Column(name = "cover_image_url", length = 255)
    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    private String testimonial;

    @Column(name = "project_date")
    private LocalDate projectDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CaseStatus status;
}