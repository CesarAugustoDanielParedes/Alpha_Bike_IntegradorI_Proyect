// routes/recuperar.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const { enviarCorreo } = require('../utils/email'); // usamos el mismo helper de envío de correos

// ======================================================
// 1️⃣ SOLICITAR CÓDIGO DE RECUPERACIÓN
// ======================================================
router.post('/solicitar', async (req, res) => {
    const { correo } = req.body;

    try {
        // Buscar usuario
        const [rows] = await pool.query('SELECT Id, NombreCompleto FROM Usuarios WHERE Correo = ?', [correo]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No existe una cuenta asociada a este correo.' });
        }

        const usuario = rows[0];
        const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
        const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

        // Guardar en RecuperacionContrasena
        await pool.query(
            `INSERT INTO RecuperacionContrasena (UsuarioId, Token, FechaExpiracion, Usado)
             VALUES (?, ?, ?, 0)`,
            [usuario.Id, codigo, fechaExpiracion]
        );

        // Enviar correo con el código
        await enviarCorreo(
            correo,
            'Código de recuperación - Alpha Bike',
            `
            <h2>Recuperación de contraseña</h2>
            <p>Hola ${usuario.NombreCompleto},</p>
            <p>Tu código para recuperar la contraseña es:</p>
            <h1>${codigo}</h1>
            <p>Este código expirará en 15 minutos.</p>
            `
        );

        res.json({ mensaje: 'Código de recuperación enviado al correo.' });
    } catch (err) {
        console.error('Error al generar código:', err);
        res.status(500).json({ error: 'Error al procesar la solicitud.' });
    }
});

// ======================================================
// 2️⃣ VERIFICAR CÓDIGO
// ======================================================
router.post('/verificar', async (req, res) => {
    const { correo, codigo } = req.body;

    try {
        const [usuarioRows] = await pool.query('SELECT Id FROM Usuarios WHERE Correo = ?', [correo]);
        if (usuarioRows.length === 0) {
            return res.status(404).json({ error: 'Correo no encontrado.' });
        }

        const usuarioId = usuarioRows[0].Id;

        const [rows] = await pool.query(
            `SELECT * FROM RecuperacionContrasena 
             WHERE UsuarioId = ? AND Token = ? AND Usado = 0 
             ORDER BY FechaExpiracion DESC LIMIT 1`,
            [usuarioId, codigo]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Código inválido o ya usado.' });
        }

        const registro = rows[0];
        if (new Date(registro.FechaExpiracion) < new Date()) {
            return res.status(400).json({ error: 'El código ha expirado.' });
        }

        // Marcar como usado (para que no se reutilice)
        await pool.query('UPDATE RecuperacionContrasena SET Usado = 1 WHERE Id = ?', [registro.Id]);

        res.json({ mensaje: 'Código verificado correctamente.' });
    } catch (err) {
        console.error('Error al verificar código:', err);
        res.status(500).json({ error: 'Error al verificar el código.' });
    }
});

// ======================================================
// 3️⃣ CAMBIAR CONTRASEÑA
// ======================================================
router.post('/cambiar', async (req, res) => {
    const { correo, nuevaContrasena } = req.body;

    try {
        const [usuarioRows] = await pool.query('SELECT Id FROM Usuarios WHERE Correo = ?', [correo]);
        if (usuarioRows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioId = usuarioRows[0].Id;
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        await pool.query('UPDATE Usuarios SET Contrasena = ? WHERE Id = ?', [hashedPassword, usuarioId]);

        res.json({ mensaje: 'Contraseña actualizada exitosamente.' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
});

module.exports = router;
