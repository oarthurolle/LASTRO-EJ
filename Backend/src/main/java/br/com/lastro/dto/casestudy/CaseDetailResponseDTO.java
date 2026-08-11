package br.com.lastro.dto.casestudy;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class CaseDetailResponseDTO {

    private Long id;
    private String clientName;
    private String serviceCategory;
    private String problem;
    private String solution;
    private String result;
    private String coverImageUrl;
    private String testimonial;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;
}