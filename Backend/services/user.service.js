
// services/user.service.js (MIGRADO A MYSQL)
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usar una variable de entorno para esto es la mejor práctica!
const JWT_SECRET = 'admin123'; // ¡CAMBIA ESTO EN PRODUCCIÓN!

const UserService = {};

UserService.registrarCliente = async (userData) => {
    const { nombre, apellido, telefono, correo, contrasena } = userData;

    if (!apellido || !telefono || telefono.length !== 9 || isNaN(telefono)) {
        throw new Error("El apellido y el teléfono deben ser válidos (9 dígitos).");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    const rolId = 2; // Rol de Cliente

    try {
        const query = `
            INSERT INTO Usuarios (NombreCompleto, Apellido, Telefono, Correo, Contrasena, RolID, FechaRegistro) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const values = [nombre, apellido, telefono, correo, hashedPassword, rolId];

        await pool.query(query, values);

        return { mensaje: 'Registro exitoso. Cliente creado.' };

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new Error("El correo electrónico ya está registrado.");
        }
        throw new Error(`Error en el servicio: ${err.message}`);
    }
};

UserService.loginUsuario = async (correo, contrasena) => {
    try {
        const query = `
            SELECT u.Id, u.Contrasena, u.NombreCompleto, r.Nombre AS Rol 
            FROM Usuarios u
            JOIN Roles r ON u.RolID = r.RolID
            WHERE u.Correo = ?
        `;
        const [rows] = await pool.query(query, [correo]);

        const user = rows[0];
        if (!user) {
            throw new Error('Usuario o contraseña incorrectos.');
        }
        
        const isMatch = await bcrypt.compare(contrasena, user.Contrasena);
        if (!isMatch) {
            throw new Error('Usuario o contraseña incorrectos.');
        }
        
        const payload = {
            id: user.Id,
            rol: user.Rol
        };
        
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
