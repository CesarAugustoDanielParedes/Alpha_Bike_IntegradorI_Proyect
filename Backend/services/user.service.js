// services/user.service.js
const { conectar, sql } = require('../db'); // Ajusta la ruta a tu db.js
const bcrypt = require('bcryptjs'); // Necesitas instalarlo

const UserService = {};

UserService.registrarCliente = async (userData) => {
    // Desestructurar los nuevos campos del DTO
    const { nombre, apellido, telefono, correo, contrasena } = userData;

    // **1. Validar Campos a nivel de servidor**
    if (!apellido || !telefono || telefono.length !== 9 || isNaN(telefono)) {
        throw new Error("El apellido y el teléfono deben ser válidos (9 dígitos).");
    }

    // **2. Hasheo de Contraseña**
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);
    
    // Asignar Rol de Cliente (2)
    const rolId = 2; 

    try {
        const pool = await conectar();
        
        // **3. Consulta SQL con los nuevos campos**
        const query = `
            INSERT INTO Usuarios (NombreCompleto, Apellido, Telefono, Correo, Contrasena, RolID, FechaRegistro) 
            VALUES (@nombreCompleto, @apellido, @telefono, @correo, @contrasena, @rolId, GETDATE())
        `;

        await pool.request()
            .input('nombreCompleto', sql.NVarChar, nombre) // Mapeo de nombre a NombreCompleto
            .input('apellido', sql.NVarChar, apellido)
            .input('telefono', sql.VarChar, telefono) 
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, hashedPassword)
            .input('rolId', sql.Int, rolId)
            .query(query);

        return { mensaje: 'Registro exitoso. Cliente creado.' };

    } catch (err) {
        // Manejo de errores de duplicidad (ej: correo ya existe) o BD
        if (err.message && err.message.includes('UQ_Usuarios_Correo')) {
             throw new Error("El correo electrónico ya está registrado.");
        }
        throw new Error(`Error en el servicio: ${err.message}`);
    }
};
// services/user.service.js (Añadir al final del archivo)
// ... (código existente del servicio de registro) ...

const jwt = require('jsonwebtoken'); // Para JWT

// ** CLAVE: Definir una clave secreta para firmar tus tokens **
// Usar una variable de entorno para esto es la mejor práctica!
const JWT_SECRET = 'admin123'; // ¡CAMBIA ESTO EN PRODUCCIÓN!

UserService.loginUsuario = async (correo, contrasena) => {
    try {
        const pool = await conectar();
        
        // 1. Buscar usuario por correo
        const userResult = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query(`
                SELECT u.Id, u.Contrasena, u.NombreCompleto, r.Nombre AS Rol 
                FROM Usuarios u
                JOIN Roles r ON u.RolID = r.RolID
                WHERE u.Correo = @correo
            `);

        const user = userResult.recordset[0];
        if (!user) {
            // Usuario no encontrado
            throw new Error('Usuario o contraseña incorrectos.');
        }
        
        // 2. Comparar Contraseña Hasheada
        // user.Contrasena es el hash de la BD. contrasena es el texto plano recibido.
        const isMatch = await bcrypt.compare(contrasena, user.Contrasena);
        if (!isMatch) {
            throw new Error('Usuario o contraseña incorrectos.');
        }
        
        // 3. Generar JWT
        const payload = {
            id: user.Id,
            rol: user.Rol // Incluimos el rol en el token para autorización futura
        };
        
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        
        // 4. Devolver token y datos del usuario
        return { 
            token, 
            usuario: {
                id: user.Id,
                nombre: user.NombreCompleto,
                rol: user.Rol
            }
        };

    } catch (err) {
        // En caso de error, relanzar con un mensaje genérico para seguridad
        throw new Error(err.message || 'Error en el proceso de login.');
    }
};

module.exports = UserService;