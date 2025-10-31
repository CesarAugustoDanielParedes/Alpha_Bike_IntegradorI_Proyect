// Backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// ** DEBE SER LA MISMA CLAVE SECRETA QUE USAS EN user.service.js **
const JWT_SECRET = 'admin123'; 

// 1. Función para verificar que el usuario está autenticado (tiene un token válido)
const verificarToken = (req, res, next) => {
    // El token se espera en el encabezado 'Authorization': Bearer [token]
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // No hay encabezado de autorización
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token después de 'Bearer '

    if (!token) {
        return res.status(401).json({ error: 'Formato de token incorrecto.' });
    }

    try {
        // Verifica y decodifica el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        // Adjunta los datos del usuario (id, rol) a la solicitud (req)
        req.usuario = decoded; 
        next(); // Continuar con la siguiente función (el controlador de la ruta)

    } catch (err) {
        // El token es inválido (expiró, firma incorrecta, etc.)
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};


// 2. Función para verificar el rol del usuario (usa la función anterior)
const verificarRol = (rolRequerido) => {
    // Esta función devuelve un middleware que verifica el rol
    return (req, res, next) => {
        // El objeto req.usuario ya contiene { id, rol } si verificarToken se ejecutó antes
        if (req.usuario && req.usuario.rol === rolRequerido) {
            next(); // El rol coincide, permitir el acceso
        } else {
            // El usuario está autenticado pero no tiene el rol necesario
            return res.status(403).json({ error: 'Permiso denegado. No tienes el rol requerido.' });
        }
    };
};


module.exports = {
    verificarToken,
    verificarRol
};