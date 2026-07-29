package br.com.lastro.service;

import br.com.lastro.dto.UserApprovalResponseDTO;
import br.com.lastro.entity.Role;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.exception.exceptions.ConflictException;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.RoleRepository;
import br.com.lastro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Set<String> MANAGEABLE_ROLES = Set.of("BASIC", "ADMIN");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public void deleteUser(Long actorId, Long id) {
        User user = getUser(id);
        if (actorId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não pode excluir a própria conta.");
        }
        ensureNotDirector(user);
        userRepository.delete(user);
    }

    @Transactional
    public void updateUserRoles(Long actorId, Long id, Set<String> roleNames) {
        User user = getUser(id);
        if (actorId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Você não pode alterar os próprios cargos.");
        }
        ensureNotDirector(user);

        Set<String> normalizedRoleNames = roleNames.stream()
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
        if (normalizedRoleNames.isEmpty() || !MANAGEABLE_ROLES.containsAll(normalizedRoleNames)) {
            throw new ConflictException(
                    "Somente os cargos BASIC e ADMIN podem ser gerenciados por este endpoint."
            );
        }

        Set<Role> newRoles = roleRepository.findByNameIn(normalizedRoleNames);
        if (newRoles.size() != normalizedRoleNames.size()) {
            throw new ConflictException("Uma ou mais roles informadas não existem.");
        }

        user.setRoles(newRoles);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserApprovalResponseDTO> findByApprovalStatus(UserApprovalStatus status) {
        return userRepository.findAllByApprovalStatusOrderByCreatedAtAsc(status)
                .stream()
                .map(this::toApprovalResponse)
                .toList();
    }

    @Transactional
    public UserApprovalResponseDTO approveUser(Long id) {
        User user = getUser(id);
        if (user.getApprovalStatus() == UserApprovalStatus.APPROVED) {
            throw new ConflictException("Este usuário já foi aprovado.");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Role ADMIN não encontrada."));

        user.setRoles(new HashSet<>(Set.of(adminRole)));
        user.setEmailVerified(true);
        user.setApprovalStatus(UserApprovalStatus.APPROVED);
        return toApprovalResponse(userRepository.save(user));
    }

    @Transactional
    public UserApprovalResponseDTO rejectUser(Long id) {
        User user = getUser(id);
        if (user.getApprovalStatus() == UserApprovalStatus.APPROVED) {
            throw new ConflictException("Um usuário aprovado não pode ser reprovado por este fluxo.");
        }

        user.setApprovalStatus(UserApprovalStatus.REJECTED);
        return toApprovalResponse(userRepository.save(user));
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    private void ensureNotDirector(User user) {
        boolean director = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(role -> "DIRECTOR".equals(role.getName()));
        if (director) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "A conta da diretoria geral não pode ser alterada por este endpoint."
            );
        }
    }

    private UserApprovalResponseDTO toApprovalResponse(User user) {
        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream()
                        .map(Role::getName)
                        .sorted(Comparator.naturalOrder())
                        .toList();

        return new UserApprovalResponseDTO(
                user.getId(),
                user.getPresentationName(),
                user.getEmail(),
                user.getApprovalStatus(),
                roles,
                user.getCreatedAt()
        );
    }
}
