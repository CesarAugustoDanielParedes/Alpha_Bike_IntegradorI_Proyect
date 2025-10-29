package com.alphabike.service;

import com.alphabike.dao.UsuarioDAO;
import com.alphabike.model.Usuario;
import com.alphabike.util.EmailService;
import com.alphabike.util.TokenGenerator;

public class RecuperacionService {

    private UsuarioDAO usuarioDAO = new UsuarioDAO();

    public boolean enviarCodigoRecuperacion(String correo) {
        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);

        if (usuario == null) {
            System.out.println("⚠️ No existe usuario con ese correo.");
            return false;
        }


        String codigo = TokenGenerator.generateCodeShort(6);


        boolean actualizado = usuarioDAO.actualizarToken(correo, codigo);

        if (!actualizado) {
            System.out.println("❌ No se pudo guardar el token en la base de datos.");
            return false;
        }

        // Enviar el correo
        String asunto = "Recuperación de contraseña - AlphaBike";
        String cuerpo = "Hola " + usuario.getNombreCompleto() + ",\n\n"
                + "Tu código de recuperación es: " + codigo + "\n\n"
                + "Ingresa este código en la página para continuar con el cambio de contraseña.\n\n"
                + "AlphaBike Team";

        try {
            EmailService.enviarCorreo(correo, asunto, cuerpo);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}

