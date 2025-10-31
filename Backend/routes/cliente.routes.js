// Backend/routes/cliente.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const ClienteController = require('../controller/cliente.controller');

// Aplicar Middleware de protección a TODAS las rutas de gestión.
router.use(verificarToken);
router.use(verificarRol('Administrador'));

// Rutas de GESTIÓN DE CLIENTES

// 1. Listar y Buscar Clientes (READ)
// GET /api/admin/clientes?search=nombre@mail.com
router.get('/', ClienteController.obtenerClientes);

// 2. Actualizar estado (Activar/Desactivar) (UPDATE)
// PUT /api/admin/clientes/:id
router.put('/:id', ClienteController.actualizarEstado);

module.exports = router;