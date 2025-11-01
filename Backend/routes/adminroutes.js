// Backend/routes/admin.routes.js
const express = require('express');
const router = express.Router();
// Importar las funciones de seguridad
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');

// Este router es solo para aplicar middleware de forma GLOBAL a las rutas que lo usen
// y para rutas generales que no encajen en otro módulo (como un GET /api/admin/dashboard-stats)

// Rutas Protegidas (Todas las rutas que se monten sobre este router heredarán esta seguridad)

router.use(verificarToken);
router.use(verificarRol('Administrador'));

// Ya no incluimos las rutas router.get('/productos'), router.post('/banners'), etc. aquí.

module.exports = router;