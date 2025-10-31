// Backend/routes/public.routes.js
const express = require('express');
const router = express.Router();
const ProductoController = require('../controller/Productocontroller'); 
const BannerController = require('../controller/banner.controller');
const CatalogoController = require('../controller/catalogo.controller'); 
// ⬆️ Asegúrate de que la ruta a 'producto.controller.js' sea correcta

// Backend/routes/public.routes.js (VERIFICACIÓN)
// ...


// ... (después de las rutas de producto y banner) ...



module.exports = router;

// Rutas Públicas (NO requieren JWT ni autenticación)
// Estas rutas sirven para cualquier usuario que visite la tienda.

// Backend/routes/public.routes.js (Añadir la ruta GET /api/banners)
// ... (código existente) ...

// 1. Obtener listado de productos disponibles para la tienda
router.get('/productos', ProductoController.obtenerDisponibles);

// 2. Obtener Banners Activos (Para el carrusel en inicio.html)
router.get('/banners', BannerController.obtenerActivos); // <-- NUEVA RUTA PÚBLICA
router.get('/marcas', CatalogoController.obtenerMarcas); 
router.get('/categorias', CatalogoController.obtenerCategorias); 

module.exports = router;
// router.get('/banners', BannerController.obtenerActivos); 

