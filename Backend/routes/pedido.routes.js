// Backend/routes/pedido.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const PedidoController = require('../controller/pedido.controller');

// Aplicar Middleware de protección a TODAS las rutas de este router.
router.use(verificarToken);
router.use(verificarRol('Administrador'));

// Rutas de GESTIÓN DE PEDIDOS

// 1. Listar todos los pedidos (READ)
// GET /api/admin/pedidos
router.get('/', PedidoController.obtenerPedidos);

// 2. Actualizar el estado de un pedido (UPDATE)
// PUT /api/admin/pedidos/:id
router.put('/:id', PedidoController.actualizarEstado);

module.exports = router;