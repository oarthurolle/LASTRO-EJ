package br.com.lastro.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String presentationName;
    private List<String> roles;
    private List<String> privileges;
    private String approvalStatus;
    private LocalDateTime createdAt;
}
