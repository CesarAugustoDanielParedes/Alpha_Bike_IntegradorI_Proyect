// controllers/auth.controller.js
const UserService = require('../services/user.service'); // Ajusta la ruta
const { RegisterDTO } = require('../models/user.model'); // Ajusta la ruta

const AuthController = {};

AuthController.registroCliente = async (req, res) => {
    try {
        // Usar el DTO para validar y estructurar los datos recibidos
        const userData = new RegisterDTO(req.body); 
        
        // **Validación de campos requeridos (si no se hizo en un middleware)**
        if (!userData.nombre || !userData.correo || !userData.contrasena) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const result = await UserService.registrarCliente(userData);
        res.json(result);

    } catch (err) {
    console.error('🔥 ERROR en el controlador de registro:', err);
    res.status(400).json({ error: err.message || 'Error desconocido en el registro.' });
}
};

// controllers/auth.controller.js (Añadir este método)
// ... (Importaciones existentes) ...

AuthController.loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Faltan credenciales.' });
    }

    try {
        // Llama al nuevo servicio de login
        const result = await UserService.loginUsuario(correo, contrasena);
        
        // Envía el token, el rol y los datos del usuario
        res.json(result); 

    } catch (err) {
        // En caso de fallo de autenticación o error en el servicio
        res.status(401).json({ error: err.message || 'Error de autenticación.' });
    }
};

module.exports = AuthController;