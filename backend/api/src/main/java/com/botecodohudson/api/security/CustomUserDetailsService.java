package com.botecodohudson.api.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

import com.botecodohudson.api.repository.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + username));

        String role = usuario.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        } else if (role.startsWith("ROLE_")) {
            role = role.substring(5);
        }

        return User.builder()
            .username(usuario.getEmail())
            .password(usuario.getSenha())
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + role)))
            .build();
    }
    
}