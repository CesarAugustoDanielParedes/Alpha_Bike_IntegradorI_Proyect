package com.alphabike.util;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

public class EmailService {

    private static final String USERNAME = "luismarcaquispe2019@gmail.com";
    private static final String PASSWORD = "xgyngnlpsnfkdcub";

    public static void enviarCorreo(String destinatario, String asunto, String cuerpo) {

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(USERNAME, PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(USERNAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
            message.setSubject(asunto);
            message.setText(cuerpo);

            Transport.send(message);
            System.out.println("✅ Correo enviado a: " + destinatario);

        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("❌ Error al enviar el correo: " + e.getMessage());
        }
    }
    public static void main(String[] args) {
        enviarCorreo("etaluismarcaquispe2910@gmail.com", "Actualizar ", "Asunto: Recuperación de contraseña - AlphaBike\r\n" + //
                        "\r\n" + //
                        "Hola Luis Marcaquispe,\r\n" + //
                        "\r\n" + //
                        "Hemos recibido una solicitud para restablecer tu contraseña en AlphaBike.\r\n" + //
                        "\r\n" + //
                        "Tu código de verificación es: 608155\r\n" + //
                        "\r\n" + //
                        "Si no solicitaste este cambio, ignora este mensaje.\r\n" + //
                        "\r\n" + //
                        "Atentamente,  \r\n" + //
                        "El equipo de AlphaBike.");
    }
}


