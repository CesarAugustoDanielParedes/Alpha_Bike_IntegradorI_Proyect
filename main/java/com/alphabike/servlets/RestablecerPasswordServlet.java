package com.alphabike.servlets;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.sql.*;
import java.time.Instant;
import java.util.Properties;
import java.io.InputStream;

@WebServlet("/restablecer-password")
public class RestablecerPasswordServlet extends HttpServlet {

    private Properties cfg;

    @Override
    public void init() {
        cfg = new Properties();
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            if (in != null) cfg.load(in);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String token = req.getParameter("token");
        String nueva = req.getParameter("password");
        String confirmar = req.getParameter("passwordConfirm");

        if (token == null || nueva == null || confirmar == null || !nueva.equals(confirmar)) {
            req.setAttribute("mensaje", "Datos inválidos o contraseñas no coinciden");
            req.getRequestDispatcher("/error.jsp").forward(req, resp);
            return;
        }

        // validaciones extra de seguridad aquí (largo, patrones...)

        String url = cfg.getProperty("db.url");
        String dbUser = cfg.getProperty("db.user");
        String dbPass = cfg.getProperty("db.password");

        String select = "SELECT id, token_expiration FROM Usuario WHERE recovery_token = ?";
        String update = "UPDATE Usuario SET contrasena = ?, recovery_token = NULL, token_expiration = NULL WHERE id = ?";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
             PreparedStatement psSelect = conn.prepareStatement(select)) {

            psSelect.setString(1, token);
            try (ResultSet rs = psSelect.executeQuery()) {
                if (rs.next()) {
                    Timestamp exp = rs.getTimestamp("token_expiration");
                    if (exp != null && exp.toInstant().isAfter(Instant.now())) {
                        int id = rs.getInt("id");
                        // Aquí cifrar la nueva contraseña (bcrypt/BCrypt)
                        String hashed = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(nueva, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());
                        try (PreparedStatement psUpdate = conn.prepareStatement(update)) {
                            psUpdate.setString(1, hashed);
                            psUpdate.setInt(2, id);
                            psUpdate.executeUpdate();
                        }
                        req.setAttribute("mensaje", "Contraseña restablecida correctamente");
                        req.getRequestDispatcher("/mensaje.jsp").forward(req, resp);
                        return;
                    }
                }
            }
            req.setAttribute("mensaje", "Token inválido o expirado");
            req.getRequestDispatcher("/error.jsp").forward(req, resp);
        } catch (Exception e) {
            e.printStackTrace();
            req.setAttribute("mensaje", "Error interno: " + e.getMessage());
            req.getRequestDispatcher("/error.jsp").forward(req, resp);
        }
    }
}
