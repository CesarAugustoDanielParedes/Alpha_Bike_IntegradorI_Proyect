package com.alphabike.dao;

import java.sql.*;
import com.alphabike.model.Usuario;

public class UsuarioDAO {


    private String jdbcURL = "jdbc:sqlserver://localhost:1433;databaseName=AlphaBikeDB;encrypt=true;trustServerCertificate=true;";
    private String jdbcUsername = "sa"; 
    private String jdbcPassword = "123456789";

    private Connection conectar() throws SQLException {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            return DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Error al cargar el driver SQL Server", e);
        }
    }

    public Usuario buscarPorCorreo(String correo) {
        String sql = "SELECT * FROM Usuarios WHERE correo = ?";
        try (Connection conn = conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, correo);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(rs.getLong("id"));
                usuario.setNombreCompleto(rs.getString("nombre_completo"));
                usuario.setCorreo(rs.getString("correo"));
                usuario.setContrasena(rs.getString("contrasena"));
                usuario.setFechaRegistro(rs.getString("fecha_registro"));
                usuario.setTokenRecuperacion(rs.getString("token_recuperacion"));
                return usuario;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean actualizarToken(String correo, String token) {
        String sql = "UPDATE Usuarios SET token_recuperacion = ? WHERE correo = ?";
        try (Connection conn = conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, token);
            stmt.setString(2, correo);
            int filas = stmt.executeUpdate();
            return filas > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    public boolean actualizarContrasena(String correo, String nuevaContrasena) {
        String sql = "UPDATE Usuarios SET contrasena = ? WHERE correo = ?";
        try (Connection conn = conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, nuevaContrasena);
            stmt.setString(2, correo);
            int filas = stmt.executeUpdate();
            return filas > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}

