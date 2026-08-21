package br.com.lastro.dto.smtp;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SmtpConfigResponseDTO {

    private Long id;
    private String name;
    private String host;
    private Integer port;
    private String username;
    private String password;
    private String fromName;
    private String fromAddress;
    private String contactRecipient;
    private Boolean auth;
    private Boolean starttls;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}