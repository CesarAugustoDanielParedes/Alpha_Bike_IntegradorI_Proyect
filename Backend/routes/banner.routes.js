// Backend/routes/banner.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
const BannerController = require('../controller/banner.controller');

// Aplicar Middleware de protección a TODAS las rutas de gestión.
router.use(verificarToken);
router.use(verificarRol('Administrador'));

// RUTAS CRUD DE BANNERS
router.get('/', BannerController.obtenerTodos); // GET /api/admin/banners
router.post('/', BannerController.crearBanner); // POST /api/admin/banners
router.put('/:id', BannerController.actualizarBanner); // PUT /api/admin/banners/:id (Activar/Editar)
router.delete('/:id', BannerController.eliminarBanner); // DELETE /api/admin/banners/:id

module.exports = router;