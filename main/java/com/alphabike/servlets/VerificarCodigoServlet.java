package com.alphabike.servlets;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.sql.*;
import java.time.Instant;
import java.io.InputStream;
import java.util.Properties;

@WebServlet("/verificar-codigo")
public class VerificarCodigoServlet extends HttpServlet {

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

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String token = req.getParameter("token");
        if (token == null || token.isBlank()) {
            resp.sendRedirect(req.getContextPath() + "/error.jsp");
            return;
        }

        String url = cfg.getProperty("db.url");
        String dbUser = cfg.getProperty("db.user");
        String dbPass = cfg.getProperty("db.password");

        String q = "SELECT id, token_expiration FROM Usuario WHERE recovery_token = ?";

        try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
             PreparedStatement ps = conn.prepareStatement(q)) {
            ps.setString(1, token);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Timestamp exp = rs.getTimestamp("token_expiration");
                    if (exp != null && exp.toInstant().isAfter(Instant.now())) {
                        // token válido, mostrar página para restablecer (form con hidden token)
                        req.setAttribute("token", token);
                        req.getRequestDispatcher("/restablecer.jsp").forward(req, resp);
                        return;
                    }
                }
            }
            req.setAttribute("mensaje", "Token inválido o expirado");
            req.getRequestDispatcher("/error.jsp").forward(req, resp);
        } catch (Exception e) {
            e.printStackTrace();
            req.setAttribute("mensaje", "Error: " + e.getMessage());
            req.getRequestDispatcher("/error.jsp").forward(req, resp);
        }
    }
}
