package br.com.lastro.service;

import br.com.lastro.entity.Role;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.exception.exceptions.ConflictException;
import br.com.lastro.repository.RefreshTokenRepository;
import br.com.lastro.repository.RoleRepository;
import br.com.lastro.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private RefreshTokenRepository refreshTokenRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        roleRepository = mock(RoleRepository.class);
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        userService = new UserService(userRepository, roleRepository, refreshTokenRepository);
    }

    @Test
    void revokeAdminAccessShouldDemoteUserAndRevokeRefreshTokens() {
        User admin = user(2L, role("ADMIN"));
        Role basic = role("BASIC");

        when(userRepository.findById(2L)).thenReturn(Optional.of(admin));
        when(roleRepository.findByName("BASIC")).thenReturn(Optional.of(basic));
        when(userRepository.save(admin)).thenReturn(admin);

        var response = userService.revokeAdminAccess(1L, 2L);

        assertEquals(Set.of("BASIC"), admin.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet()));
        assertEquals(java.util.List.of("BASIC"), response.getRoles());
        verify(userRepository).save(admin);
        verify(refreshTokenRepository).deleteAllByUser(admin);
    }

    @Test
    void revokeAdminAccessShouldRejectSelfRevocation() {
        User admin = user(1L, role("ADMIN"));
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> userService.revokeAdminAccess(1L, 1L)
        );

        assertEquals(403, exception.getStatus().value());
        verify(userRepository, never()).save(admin);
        verify(refreshTokenRepository, never()).deleteAllByUser(admin);
    }

    @Test
    void revokeAdminAccessShouldProtectDirectorAccount() {
        User director = user(2L, role("DIRECTOR"));
        when(userRepository.findById(2L)).thenReturn(Optional.of(director));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> userService.revokeAdminAccess(1L, 2L)
        );

        assertEquals(403, exception.getStatus().value());
        verify(refreshTokenRepository, never()).deleteAllByUser(director);
    }

    @Test
    void revokeAdminAccessShouldRejectUserWithoutAdminRole() {
        User basic = user(2L, role("BASIC"));
        when(userRepository.findById(2L)).thenReturn(Optional.of(basic));

        assertThrows(
                ConflictException.class,
                () -> userService.revokeAdminAccess(1L, 2L)
        );
        verify(refreshTokenRepository, never()).deleteAllByUser(basic);
    }

    private User user(Long id, Role role) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@example.com");
        user.setPresentationName("Usuário " + id);
        user.setApprovalStatus(UserApprovalStatus.APPROVED);
        user.setRoles(Set.of(role));
        return user;
    }

    private Role role(String name) {
        Role role = new Role();
        role.setName(name);
        return role;
    }
}
