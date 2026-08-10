package br.com.lastro.controller;

import br.com.lastro.config.security.UsuarioPrincipal;
import br.com.lastro.dto.UserApprovalResponseDTO;
import br.com.lastro.dto.UserRolesRequestDTO;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/director/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_USER_MANAGEMENT')")
@Tag(name = "Diretoria - Gestão de Usuários", description = "Endpoints exclusivos para gestão de equipe (exclusão e cargos)")
public class DirectorUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserApprovalResponseDTO>> listUsers(
            @RequestParam(defaultValue = "PENDING") UserApprovalStatus status) {
        return ResponseEntity.ok(userService.findByApprovalStatus(status));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<UserApprovalResponseDTO> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<UserApprovalResponseDTO> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    @PatchMapping("/{id}/revoke-admin")
    @PreAuthorize("hasRole('DIRECTOR')")
    @Operation(
        summary = "Remover acesso administrativo",
        description = "Rebaixa um administrador para o perfil básico e encerra suas sessões renováveis."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Acesso administrativo removido"),
        @ApiResponse(responseCode = "403", description = "Ação permitida somente à conta da diretoria"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
        @ApiResponse(responseCode = "409", description = "Usuário não possui acesso administrativo")
    })
    public ResponseEntity<UserApprovalResponseDTO> revokeAdminAccess(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(
                userService.revokeAdminAccess(principal.getUserDto().getId(), id)
        );
    }

    @Operation(
        summary = "Excluir Usuário do Sistema", 
        description = "Deleta fisicamente um usuário do banco de dados (Hard Delete). Esta ação é irreversível e exige privilégios de Diretoria."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Usuário excluído com sucesso"),
        @ApiResponse(responseCode = "403", description = "Acesso negado - Privilégios insuficientes"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID único do usuário a ser excluído", required = true, example = "1") 
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        userService.deleteUser(principal.getUserDto().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "Atualizar Cargos (Roles)", 
        description = "Substitui de forma absoluta todos os cargos atuais do usuário pelos novos informados no payload. Útil para promover ou rebaixar membros da equipe."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cargos atualizados com sucesso"),
        @ApiResponse(responseCode = "400", description = "Payload inválido ou lista de cargos vazia"),
        @ApiResponse(responseCode = "403", description = "Acesso negado - Privilégios insuficientes"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @PutMapping("/{id}/roles")
    public ResponseEntity<Void> updateUserRoles(
            @Parameter(description = "ID único do usuário a ser modificado", required = true, example = "1") 
            @PathVariable Long id, 
            @RequestBody @Valid UserRolesRequestDTO dto,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        userService.updateUserRoles(principal.getUserDto().getId(), id, dto.getRoles());
        return ResponseEntity.ok().build();
    }
}
