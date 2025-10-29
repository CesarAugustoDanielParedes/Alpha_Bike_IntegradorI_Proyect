package com.alphabike.servlets;

import com.alphabike.dao.UsuarioDAO;
import com.alphabike.model.Usuario;
import com.alphabike.util.EmailService;
import com.alphabike.util.TokenGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;

@WebServlet("/recuperar-password")
public class RecuperarPasswordServlet extends HttpServlet {

    private final UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain;charset=UTF-8");
        String correo = request.getParameter("correo");

        if (correo == null || correo.trim().isEmpty()) {
            response.getWriter().write("El correo es obligatorio.");
            return;
        }

        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);

        if (usuario == null) {
            response.getWriter().write("No existe un usuario con ese correo.");
            return;
        }


        String codigoCorto = TokenGenerator.generateCodeShort(6);

        try {

            String asunto = "Recuperación de contraseña - AlphaBike";
            String mensaje = "Hola " + usuario.getNombreCompleto() + ",\n\n"
                    + "Tu código de recuperación es: " + codigoCorto + "\n\n"
                    + "Ingresa este código en la página para continuar con el cambio de contraseña.\n\n"
                    + "AlphaBike Team";

            System.out.println("➡️ Enviando correo a: " + correo);
            EmailService.enviarCorreo(correo, asunto, mensaje);
            System.out.println("✅ Correo enviado exitosamente.");

            usuarioDAO.actualizarToken(correo, codigoCorto);

            response.getWriter().write("Código enviado correctamente al correo.");

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error al enviar el correo: " + e.getMessage());
        }
    }
}

