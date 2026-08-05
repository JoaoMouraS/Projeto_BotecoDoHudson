package com.botecodohudson.api.controller;

import com.botecodohudson.api.dto.UsuarioCadastroDTO;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite requisições do front-end
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/cadastrar")
    public ResponseEntity<?> cadastrarUsuario(@RequestBody UsuarioCadastroDTO cadastroDTO) {
        
        // 1. Verifica se o e-mail já está em uso
        Optional<UsuarioModel> usuarioExistente = usuarioRepository.findByEmail(cadastroDTO.getEmail());
        if (usuarioExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Este e-mail já está em uso.");
        }

        // 2. Prepara o novo usuário para salvar no banco
        UsuarioModel novoUsuario = new UsuarioModel();
        novoUsuario.setNome(cadastroDTO.getNome());
        novoUsuario.setEmail(cadastroDTO.getEmail());
        
        // 3. CRIPTOGRAFA a senha antes de salvar! (Muito importante)
        novoUsuario.setSenha(passwordEncoder.encode(cadastroDTO.getSenha()));
        
        // 4. Define o tipo de conta (se vier vazio do front, define como USER)
        String role = cadastroDTO.getRole();
        if (role == null || role.trim().isEmpty()) {
            role = "USER";
        }
        novoUsuario.setRole(role);

        // 5. Salva no banco de dados
        usuarioRepository.save(novoUsuario);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
    }
}