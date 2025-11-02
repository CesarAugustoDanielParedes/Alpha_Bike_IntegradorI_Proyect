// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Necesario para consultar MySQL
const AuthController = require('../controller/auth.controller'); // Ajusta la ruta si es necesario

// 🟢 Ruta para registro de clientes
router.post('/registro', AuthController.registroCliente);

// 🟢 Ruta para iniciar sesión
router.post('/login', AuthController.loginUsuario);

const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🟢 NUEVA RUTA: Verificación de cuenta por correo
router.get('/verificar/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // 1️⃣ Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin123');
        const userId = decoded.userId;

        // 2️⃣ Actualizar al usuario como verificado
        const [result] = await pool.query(
            'UPDATE usuarios SET Verificado = 1 WHERE Id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).send('❌ Usuario no encontrado o ya verificado.');
        }

        // 3️⃣ Respuesta exitosa
        res.send(`
            <html>
                <head><title>Cuenta Verificada</title></head>
                <body style="font-family:sans-serif; text-align:center; margin-top:50px;">
                    <h2>✅ Tu cuenta ha sido verificada correctamente</h2>
                    <p>Ya puedes iniciar sesión en Alpha Bike.</p>
                    <a href="http://localhost:3000/iniciosesion.html">Ir al inicio de sesión</a>
                </body>
            </html>
        `);

    } catch (err) {
        console.error('Error al verificar la cuenta:', err);
        res.status(400).send('❌ Enlace inválido o expirado. Por favor solicita otro.');
    }
});
//-----------recuperacion de contra---------------------//
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 🟢 Paso 1: Solicitar recuperación de contraseña
router.post('/recuperar', async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'Debe ingresar un correo electrónico.' });
    }

    try {
        // 1️⃣ Verificar si el correo existe
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE Correo = ?', [correo]);
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'No existe una cuenta con ese correo.' });
        }

        const usuario = usuarios[0];

        // 2️⃣ Generar código de 6 dígitos y fecha de expiración
        const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // Ej: 345821
        const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // 3️⃣ Guardar el token en la tabla recuperacioncontrasena
        await pool.query(
            `INSERT INTO recuperacioncontrasena (UsuarioId, Token, FechaExpiracion, Usado)
             VALUES (?, ?, ?, 0)`,
            [usuario.Id, codigo, expiracion]
        );

        // 4️⃣ Configurar y enviar el correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Alpha Bike" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: 'Recuperación de contraseña - Alpha Bike',
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Tu código de verificación es:</p>
                <h1 style="letter-spacing:5px;">${codigo}</h1>
                <p>Este código expirará en 15 minutos.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ mensaje: 'Código de verificación enviado a tu correo.' });

    } catch (err) {
        console.error('Error en la recuperación:', err);
        res.status(500).json({ error: 'Error al procesar la recuperación de contraseña.' });
    }
});
// 🟢 Paso 2: Verificar el código recibido
router.post('/verificar-codigo', async (req, res) => {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
        return res.status(400).json({ error: 'Debe ingresar el correo y el código.' });
    }

    try {
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE Correo = ?', [correo]);
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'No existe una cuenta con ese correo.' });
        }

        const usuario = usuarios[0];

        // Buscar token activo
        const [tokens] = await pool.query(
            `SELECT * FROM recuperacioncontrasena
             WHERE UsuarioId = ? AND Token = ? AND Usado = 0 AND FechaExpiracion > NOW()`,
            [usuario.Id, codigo]
        );

        if (tokens.length === 0) {
            return res.status(400).json({ error: 'Código inválido o expirado.' });
        }

        // Marcar el código como usado (opcional hacerlo luego de cambio)
        await pool.query('UPDATE recuperacioncontrasena SET Usado = 1 WHERE Id = ?', [tokens[0].Id]);

        res.json({ mensaje: 'Código verificado correctamente. Puedes restablecer tu contraseña.' });

    } catch (err) {
        console.error('Error al verificar el código:', err);
        res.status(500).json({ error: 'Error interno al verificar el código.' });
    }
});
// 🟢 Paso 3: Actualizar nueva contraseña
router.post('/nueva-contrasena', async (req, res) => {
    const { correo, nuevaContrasena } = req.body;

    if (!correo || !nuevaContrasena) {
        return res.status(400).json({ error: 'Debe ingresar correo y nueva contraseña.' });
    }

    try {
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE Correo = ?', [correo]);
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const hash = await bcrypt.hash(nuevaContrasena, 10);

        await pool.query('UPDATE usuarios SET Contrasena = ? WHERE Correo = ?', [hash, correo]);

        res.json({ mensaje: 'Contraseña actualizada correctamente.' });

    } catch (err) {
        console.error('Error al actualizar la contraseña:', err);
        res.status(500).json({ error: 'Error interno al cambiar la contraseña.' });
    }
});


module.exports = router;
