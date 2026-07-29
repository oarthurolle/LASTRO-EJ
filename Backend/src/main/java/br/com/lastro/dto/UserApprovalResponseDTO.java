package br.com.lastro.dto;

import br.com.lastro.entity.UserApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserApprovalResponseDTO {
    private Long id;
    private String presentationName;
    private String email;
    private UserApprovalStatus approvalStatus;
    private List<String> roles;
    private LocalDateTime createdAt;
}

