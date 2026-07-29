package br.com.lastro.config.security;

import br.com.lastro.dto.UserDTO;
import br.com.lastro.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UsuarioPrincipal implements UserDetails {

    private final UserDTO userDto;
    private final Collection<? extends GrantedAuthority> authorities;

    public UsuarioPrincipal(User user, Collection<? extends GrantedAuthority> authorities) {
        this.userDto = mapToDto(user);
        this.authorities = authorities;
    }

    public UserDTO getUserDto() { return this.userDto; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getUsername() { return userDto.getEmail(); }

    @Override public String getPassword() { return null; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    private UserDTO mapToDto(User user) {
        UserDTO userDto = new UserDTO();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setPresentationName(user.getPresentationName());
        userDto.setApprovalStatus(user.getApprovalStatus().name());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setRoles(user.getRoles() == null
                ? List.of()
                : user.getRoles().stream()
                        .map(role -> role.getName())
                        .sorted()
                        .toList());
        userDto.setPrivileges(user.getRoles() == null
                ? List.of()
                : user.getRoles().stream()
                        .filter(role -> role.getPrivileges() != null)
                        .flatMap(role -> role.getPrivileges().stream())
                        .map(privilege -> privilege.getName())
                        .distinct()
                        .sorted()
                        .toList());

        return userDto;
    }
}
