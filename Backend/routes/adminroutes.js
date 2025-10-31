// Backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();
// Importar las funciones de seguridad
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
// Asumimos que tienes un controlador para la lógica del panel
// const AdminController = require('../controllers/admin.controller'); 

// CLAVE: Definir el middleware que se aplicará a todas las rutas del administrador.
// 1. Debe verificar el token (verificarToken)
// 2. Debe verificar que el rol sea 'Administrador' (verificarRol('Administrador'))

// Middleware a nivel de router, se aplica a todas las rutas definidas abajo
router.use(verificarToken); // Primero, verifica que haya un token válido
router.use(verificarRol('Administrador')); // Segundo, verifica que el rol sea Administrador


// Rutas Protegidas del Panel de Administración:
// Ejemplo: Obtener todos los productos (solo Admin)
router.get('/productos', (req, res) => {
    // Si llega aquí, el usuario es Admin y su token es válido.
    // Llama al controlador para obtener datos...
    res.json({ mensaje: 'ACCESO PERMITIDO: Lista de productos para el administrador.' });
});

// Ejemplo: Crear un nuevo banner (solo Admin)
router.post('/banners', (req, res) => {
    res.json({ mensaje: 'ACCESO PERMITIDO: Banner creado.' });
});

// ¡Puedes añadir todas tus rutas de Producto, Banner, Pedido y Cliente aquí!

module.exports = router;