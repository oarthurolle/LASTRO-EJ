package br.com.lastro.controller;

import br.com.lastro.config.security.UsuarioPrincipal;
import br.com.lastro.config.PublicMediaConfig;
import br.com.lastro.entity.Role;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DirectorUserController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = PublicMediaConfig.class
        )
)
@Import(DirectorUserControllerSecurityTest.MethodSecurityConfiguration.class)
class DirectorUserControllerSecurityTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    UserService userService;

    @Test
    void revokeAdminShouldRejectNonDirectorWithManagementPrivilege() throws Exception {
        mockMvc.perform(patch("/api/director/users/2/revoke-admin")
                        .with(csrf())
                        .with(authentication(authenticationFor(1L, "ADMIN"))))
                .andExpect(status().isForbidden());

        verifyNoInteractions(userService);
    }

    @Test
    void revokeAdminShouldAllowDirector() throws Exception {
        mockMvc.perform(patch("/api/director/users/2/revoke-admin")
                        .with(csrf())
                        .with(authentication(authenticationFor(1L, "DIRECTOR"))))
                .andExpect(status().isOk());

        verify(userService).revokeAdminAccess(1L, 2L);
    }

    private UsernamePasswordAuthenticationToken authenticationFor(Long id, String roleName) {
        Role role = new Role();
        role.setName(roleName);

        User user = new User();
        user.setId(id);
        user.setEmail(roleName.toLowerCase() + "@lastro.test");
        user.setPresentationName(roleName);
        user.setApprovalStatus(UserApprovalStatus.APPROVED);
        user.setRoles(Set.of(role));

        var authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + roleName),
                new SimpleGrantedAuthority("PRIV_USER_MANAGEMENT")
        );
        UsuarioPrincipal principal = new UsuarioPrincipal(user, authorities);
        return new UsernamePasswordAuthenticationToken(principal, "token", authorities);
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class MethodSecurityConfiguration {
    }
}
