// server.js
const express = require('express');
const cors = require('cors'); 
const path = require('path'); 

// *************************************************************
// 1. IMPORTAR RUTAS MODULARES 
// *************************************************************
// Rutas de Autenticación
const authRoutes = require('./routes/auth.routes.js'); 

// Rutas Públicas (Catálogo, Banners, Marcas, Categorías)
const publicRoutes = require('./routes/public.routes.js'); 

// Rutas Protegidas de Administración
const adminRoutes = require('./routes/adminroutes.js'); 
const productoRoutes = require('./routes/producto.routes.js'); 
const pedidoRoutes = require('./routes/pedido.routes.js'); 
const bannerRoutes = require('./routes/banner.routes.js'); 
const clienteRoutes = require('./routes/cliente.routes.js'); 
const marcaRoutes = require('./routes/marca.routes.js'); 
const categoriaRoutes = require('./routes/categoria.routes.js'); 


const app = express();

// Middlewares Globales
app.use(cors()); 
app.use(express.json()); // Permite a Express leer el cuerpo de las solicitudes JSON


// *************************************************************
// 2. CONFIGURACIÓN PARA SERVIR EL FRONTEND (Archivos Estáticos)
// *************************************************************
const frontendPath = path.join(__dirname, '..', 'Frontend'); 

app.use(express.static(frontendPath));

// Ruta raíz: Carga el inicio.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'inicio.html')); 
});
// *************************************************************


// *************************************************************
// 3. MONTAJE DE RUTAS API MODULARES
// *************************************************************

// A) Rutas Públicas (NO PROTEGIDAS)
// Monta: /api/registro, /api/login, /api/productos, /api/banners, /api/marcas, /api/categorias
app.use('/api', authRoutes); 
app.use('/api', publicRoutes); 


// B) Rutas de ADMINISTRACIÓN (PROTEGIDAS por JWT)
// Todas las rutas de CRUD y gestión para el panel.
// ----------------------------------------------------
app.use('/api/admin', adminRoutes); 
app.use('/api/admin/productos', productoRoutes); 
app.use('/api/admin/pedidos', pedidoRoutes); 
app.use('/api/admin/banners', bannerRoutes); 
app.use('/api/admin/clientes', clienteRoutes); 
app.use('/api/admin/marcas', marcaRoutes); 
app.use('/api/admin/categorias', categoriaRoutes); 
// *************************************************************


// 4. Inicialización del Servidor
app.listen(3000, () => console.log('Servidor AlphaBike corriendo en http://localhost:3000'));