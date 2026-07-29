package br.com.lastro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "partners")
public class Partner {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "partners_sequence")
    @SequenceGenerator(
            name = "partners_sequence",
            sequenceName = "partners_seq_generator",
            allocationSize = 1
    )
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "logo_url", nullable = false, length = 255)
    private String logoUrl;

    @Column(name = "external_link", length = 255)
    private String externalLink;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private Boolean active;
}
