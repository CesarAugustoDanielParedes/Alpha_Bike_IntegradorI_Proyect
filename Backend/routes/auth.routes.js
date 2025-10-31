// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controller/auth.controller'); // Ajusta la ruta

// Ruta para registro de clientes
router.post('/registro', AuthController.registroCliente);
// routes/auth.routes.js (Añadir esta ruta)
// ... (código existente de la ruta de registro) ...

// Ruta para iniciar sesión
router.post('/login', AuthController.loginUsuario); // <-- Nueva ruta de login

module.exports = router;

