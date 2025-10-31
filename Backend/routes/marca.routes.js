// Backend/routes/marca.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const MarcaController = require('../controller/marca.controller');

// Aplicar Middleware de protección a TODAS las rutas de gestión.
router.use(verificarToken);
router.use(verificarRol('Administrador'));

// RUTAS CRUD DE MARCAS
router.get('/', MarcaController.obtenerTodas); // GET /api/admin/marcas
router.post('/', MarcaController.crearMarca); // POST /api/admin/marcas
router.put('/:id', MarcaController.actualizarMarca); // PUT /api/admin/marcas/:id
router.delete('/:id', MarcaController.eliminarMarca); // DELETE /api/admin/marcas/:id

module.exports = router;