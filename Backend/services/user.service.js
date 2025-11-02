// services/user.service.js (MIGRADO A MYSQL + VERIFICACIÓN DE CORREO)
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { enviarCorreo } = require('../utils/email'); // ✅ nuevo
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // usa .env si existe

const UserService = {};

// =======================================================
// REGISTRO DE CLIENTE CON ENVÍO DE CÓDIGO DE VERIFICACIÓN
// =======================================================
UserService.registrarCliente = async (userData) => {
    const { nombre, apellido, telefono, correo, contrasena } = userData;

    if (!apellido || !telefono || telefono.length !== 9 || isNaN(telefono)) {
        throw new Error("El apellido y el teléfono deben ser válidos (9 dígitos).");
    }

    // 1️⃣ Revisar si el correo ya existe
    const [existe] = await pool.query(`SELECT * FROM Usuarios WHERE Correo = ?`, [correo]);
    if (existe.length > 0) {
        throw new Error("El correo electrónico ya está registrado.");
    }

    // 2️⃣ Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    const rolId = 2; // Rol de Cliente

    try {
        // 3️⃣ Insertar usuario con Verificado = 0
        const query = `
            INSERT INTO Usuarios (NombreCompleto, Apellido, Telefono, Correo, Contrasena, RolID, FechaRegistro, Verificado)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)
        `;
        const values = [nombre, apellido, telefono, correo, hashedPassword, rolId];
        const [result] = await pool.query(query, values);

        // 4️⃣ Crear token de verificación válido por 1 día
        const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '1d' });

        // 5️⃣ Enviar correo con enlace de verificación
        const enlace = `http://localhost:3000/api/verificar/${token}`;
        await enviarCorreo(
            correo,
            'Verifica tu cuenta - Alpha Bike',
            `
            <h2>¡Bienvenido a Alpha Bike!</h2>
            <p>Hola ${nombre}, gracias por registrarte.</p>
            <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
            <a href="${enlace}" target="_blank">Verificar mi cuenta</a>
            <p>Este enlace expirará en 24 horas.</p>
            `
        );

        return { mensaje: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' };

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new Error("El correo electrónico ya está registrado.");
        }
        throw new Error(`Error en el servicio: ${err.message}`);
    }
};

// =========================================
// LOGIN (CON VERIFICACIÓN DE CUENTA ACTIVA)
// =========================================
UserService.loginUsuario = async (correo, contrasena) => {
    try {
        const query = `
            SELECT u.Id, u.Contrasena, u.NombreCompleto, u.Verificado, r.Nombre AS Rol 
            FROM Usuarios u
            JOIN Roles r ON u.RolID = r.RolID
            WHERE u.Correo = ?
        `;
        const [rows] = await pool.query(query, [correo]);

        const user = rows[0];
        if (!user) {
            throw new Error('Usuario o contraseña incorrectos.');
        }

        // 1️⃣ Validar contraseña
        const isMatch = await bcrypt.compare(contrasena, user.Contrasena);
        if (!isMatch) {
            throw new Error('Usuario o contraseña incorrectos.');
        }

        // 2️⃣ Verificar si la cuenta está activada
        if (!user.Verificado) {
            throw new Error('Tu cuenta aún no está verificada. Revisa tu correo.');
        }

        // 3️⃣ Generar token JWT de sesión
        const payload = { id: user.Id, rol: user.Rol };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return {
            token,
            usuario: {
                id: user.Id,
                nombre: user.NombreCompleto,
                rol: user.Rol
            }
        };

    } catch (err) {
        throw new Error(err.message || 'Error en el proceso de login.');
    }
};

module.exports = UserService;

