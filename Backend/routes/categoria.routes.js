// Backend/routes/categoria.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const CategoriaController = require('../controller/categoria.controller');

// Aplicar Middleware de protección a TODAS las rutas de gestión.
router.use(verificarToken);
router.use(verificarRol('Administrador'));

// RUTAS CRUD DE CATEGORÍAS
router.get('/', CategoriaController.obtenerTodas); // GET /api/admin/categorias
router.post('/', CategoriaController.crearCategoria); // POST /api/admin/categorias
router.put('/:id', CategoriaController.actualizarCategoria); // PUT /api/admin/categorias/:id
router.delete('/:id', CategoriaController.eliminarCategoria); // DELETE /api/admin/categorias/:id

module.exports = router;