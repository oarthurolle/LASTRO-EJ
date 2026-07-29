package br.com.lastro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class RefreshRequest {
    @NotBlank
    @Size(max = 256)
    private String refreshToken;
}
