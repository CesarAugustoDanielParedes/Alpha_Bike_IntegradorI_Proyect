package com.alphabike.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/registro")
    public Map<String,Object> registrar(@RequestBody Map<String, Object> body) {
        String nombre = (String) body.get("nombre");
        String correo = (String) body.get("correo");
        String contrasena = (String) body.get("contrasena");

        if (nombre == null || correo == null || contrasena == null) {
            return Map.of("error","Faltan campos requeridos");
        }

        // Hashear contraseña con BCrypt
        String hashed = BCrypt.hashpw(contrasena, BCrypt.gensalt());

        String sql = "INSERT INTO Usuarios (NombreCompleto, Correo, Contrasena) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, nombre, correo, hashed);
        return Map.of("mensaje","Usuario registrado");
    }

    @PostMapping("/login")
    public Object login(@RequestBody Map<String, Object> body) {
        String correo = (String) body.get("correo");
        String contrasena = (String) body.get("contrasena");

        String sql = "SELECT * FROM Usuarios WHERE Correo = ?";
        List<Map<String, Object>> usuarios = jdbcTemplate.queryForList(sql, correo);

        if (usuarios.isEmpty()) {
            return Map.of("error", "Credenciales inválidas");
        }

        Map<String,Object> user = usuarios.get(0);
        String storedHash = (String) user.get("Contrasena");
        boolean ok = BCrypt.checkpw(contrasena, storedHash);
        if (!ok) return Map.of("error", "Credenciales inválidas");
        // Remove password before returning user info
        user.remove("Contrasena");
        return Map.of("mensaje", "Inicio de sesión correcto", "usuario", user);
    }
}
