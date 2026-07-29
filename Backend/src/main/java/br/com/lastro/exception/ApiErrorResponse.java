package br.com.lastro.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private Instant timestamp;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<FieldViolation> fieldViolations;
}
