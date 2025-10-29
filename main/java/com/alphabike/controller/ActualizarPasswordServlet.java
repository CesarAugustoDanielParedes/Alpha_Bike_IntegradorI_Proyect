package com.alphabike.controller;

import com.alphabike.dao.UsuarioDAO;
import com.alphabike.model.Usuario;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/actualizar-password")
public class ActualizarPasswordServlet extends HttpServlet {

    private UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String correo = request.getParameter("correo");
        String codigo = request.getParameter("codigo");
        String nuevaContrasena = request.getParameter("nuevaContrasena");

        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);

        if (usuario == null) {
            response.getWriter().write("Usuario no encontrado");
            return;
        }

        if (!codigo.equals(usuario.getTokenRecuperacion())) {
            response.getWriter().write("Código incorrecto");
            return;
        }

        usuarioDAO.actualizarContrasena(correo, nuevaContrasena);
        response.getWriter().write("Contraseña actualizada correctamente");
    }
}

