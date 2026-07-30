package br.com.lastro.config.security;

import br.com.lastro.entity.Privilege;
import br.com.lastro.entity.Role;
import br.com.lastro.entity.User;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UsuarioPrincipalTest {

    @Test
    void shouldExposeCurrentRolesAndDistinctPrivileges() {
        Privilege blogAdmin = privilege("PRIV_BLOG_ADMIN");
        Privilege userManagement = privilege("PRIV_USER_MANAGEMENT");

        Role admin = role("ADMIN", Set.of(blogAdmin));
        Role director = role("DIRECTOR", Set.of(blogAdmin, userManagement));

        User user = new User();
        user.setId(7L);
        user.setEmail("diretor@lastro.com");
        user.setPresentationName("Diretora LASTRO");
        user.setRoles(Set.of(admin, director));

        UsuarioPrincipal principal = new UsuarioPrincipal(user, Set.of());

        assertEquals(7L, principal.getUserDto().getId());
        assertEquals("Diretora LASTRO", principal.getUserDto().getPresentationName());
        assertEquals(
                Set.of("ADMIN", "DIRECTOR"),
                Set.copyOf(principal.getUserDto().getRoles())
        );
        assertEquals(
                Set.of("PRIV_BLOG_ADMIN", "PRIV_USER_MANAGEMENT"),
                Set.copyOf(principal.getUserDto().getPrivileges())
        );
    }

    private Privilege privilege(String name) {
        Privilege privilege = new Privilege();
        privilege.setName(name);
        return privilege;
    }

    private Role role(String name, Set<Privilege> privileges) {
        Role role = new Role();
        role.setName(name);
        role.setPrivileges(privileges);
        return role;
    }
}
