// Backend/routes/producto.routes.js
const express = require('express');
const router = express.Router();
// Importar las funciones de seguridad
const { verificarToken, verificarRol } = require('../middleware/auth.middleware');
// Importar el controlador que tiene toda la lógica CRUD
const ProductoController = require('../controller/Productocontroller');

// -----------------------------------------------------------------
// APLICACIÓN DEL MIDDLEWARE DE SEGURIDAD
// Estas dos líneas protegen TODAS las rutas definidas en este router.
// -----------------------------------------------------------------
router.use(verificarToken);
router.use(verificarRol('Administrador'));
// -----------------------------------------------------------------


// RUTAS CRUD DE PRODUCTOS (Solo accesibles por el Admin con Token válido)

// 1. LISTAR / BUSCAR productos (READ)
// GET /api/admin/productos?search=bici
router.get('/', ProductoController.obtenerTodos);

// 2. CREAR un nuevo producto (CREATE)
// POST /api/admin/productos
router.post('/', ProductoController.crearProducto);

// 3. ACTUALIZAR un producto existente (UPDATE)
// PUT /api/admin/productos/:id
router.put('/:id', ProductoController.actualizarProducto);

// 4. ELIMINAR un producto (DELETE)
// DELETE /api/admin/productos/:id
router.delete('/:id', ProductoController.eliminarProducto);


module.exports = router;