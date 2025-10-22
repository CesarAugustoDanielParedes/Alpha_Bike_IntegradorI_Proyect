const express = require('express');
const cors = require('cors');
const { conectar } = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 🗂️ Crear carpetas si no existen
const rutasUploads = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/productos'),
  path.join(__dirname, 'uploads/marcas'),
  path.join(__dirname, 'uploads/imagenes_referencia') // ✅ NUEVA carpeta
];
rutasUploads.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🖼️ Configuración dinámica de almacenamiento con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let carpetaDestino = path.join(__dirname, 'uploads');

    if (req.body.tipo === 'productos') {
      carpetaDestino = path.join(__dirname, 'uploads/productos');
    } else if (req.body.tipo === 'marcas') {
      carpetaDestino = path.join(__dirname, 'uploads/marcas');
    } else if (req.body.tipo === 'imagenes_referencia') {
      carpetaDestino = path.join(__dirname, 'uploads/imagenes_referencia');
    }

    cb(null, carpetaDestino);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + path.extname(file.originalname);
    cb(null, nombreArchivo);
  }
});

const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🧩 Ruta de prueba
app.get('/', (req, res) => {
  res.send('🚴 Servidor AlphaBike conectado correctamente!');
});

// 🧩 Registrar usuario
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  try {
    const conexion = await conectar();
    await conexion.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, contrasena]
    );
    res.json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('🔥 ERROR en registro:', err);
    res.status(500).json({ error: err.message });
  }
});

// 🧩 Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const conexion = await conectar();
    const [filas] = await conexion.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        m.nombre AS marca,
        m.logo AS logo_marca
      FROM productos p
      LEFT JOIN marcas m ON p.marca_id = m.id
    `);
    res.json(filas);
  } catch (err) {
    console.error('🔥 ERROR al obtener productos:', err);
    res.status(500).json({ error: err.message });
  }
});

// 🧩 Filtrar productos (OR entre filtros, case-insensitive)
app.get('/api/productos/filtrar', async (req, res) => {
  try {
    const conexion = await conectar();
    const { categoria, marca, tipo, producto, precioMax } = req.query;

    let baseQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        c.nombre AS categoria,
        m.nombre AS marca,
        m.logo AS logo_marca
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
    `;

    const condiciones = [];
    const params = [];

    if (categoria) {
      condiciones.push('LOWER(c.nombre) = ?');
      params.push(String(categoria).toLowerCase());
    }

    if (marca) {
      condiciones.push('LOWER(m.nombre) = ?');
      params.push(String(marca).toLowerCase());
    }

    // 'tipo' lo buscamos dentro del nombre del producto (o cámbialo por la columna real)
    if (tipo) {
      condiciones.push('LOWER(p.nombre) LIKE ?');
      params.push(`%${String(tipo).toLowerCase()}%`);
    }

    // 'producto' busca por nombre también (puedes cambiar la columna si quieres)
    if (producto) {
      condiciones.push('LOWER(p.nombre) LIKE ?');
      params.push(`%${String(producto).toLowerCase()}%`);
    }

    if (precioMax) {
      // precio es una condición que también se incluye en el OR
      condiciones.push('p.precio <= ?');
      params.push(Number(precioMax));
    }

    let finalQuery = baseQuery;
    if (condiciones.length) {
      // si hay condiciones, unirlas con OR y envolver entre paréntesis
      finalQuery += ' WHERE (' + condiciones.join(' OR ') + ')';
    }
    // si no hay condiciones devolvemos todos (sin WHERE)

    const [filas] = await conexion.query(finalQuery, params);
    res.json(filas);
  } catch (err) {
    console.error('🔥 ERROR al filtrar productos:', err);
    res.status(500).json({ error: err.message });
  }
});
// 🧩 Filtrado avanzado compatible con radios
app.post('/api/productos/filtrarAvanzado', async (req, res) => {
  try {
    const conexion = await conectar();
    const { categoria, producto, marca, precioMax } = req.body || {};

    console.log('🟡 Filtros recibidos:', req.body);

    let baseQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        c.nombre AS categoria,
        m.nombre AS marca,
        m.logo AS logo_marca
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
    `;

    const condiciones = [];
    const params = [];

    // --- Filtros dinámicos ---
    if (categoria) {
      // se usa LIKE para soportar nombres tipo "bicicleta/downhill"
      condiciones.push('LOWER(c.nombre) LIKE ?');
      params.push(`%${categoria.toLowerCase()}%`);
    }

    if (producto) {
      condiciones.push('LOWER(p.nombre) LIKE ?');
      params.push(`%${producto.toLowerCase()}%`);
    }

    if (marca) {
      condiciones.push('LOWER(m.nombre) = ?');
      params.push(marca.toLowerCase());
    }

    if (precioMax && !isNaN(precioMax)) {
      condiciones.push('p.precio <= ?');
      params.push(Number(precioMax));
    }

    let finalQuery = baseQuery;
    if (condiciones.length > 0) {
      finalQuery += ' WHERE ' + condiciones.join(' AND ');
    }

    console.log('🧩 SQL generada:', finalQuery);
    console.log('🧩 Parámetros:', params);

    const [filas] = await conexion.query(finalQuery, params);
    res.json(filas);
  } catch (err) {
    console.error('🔥 ERROR en filtrado avanzado:', err);
    res.status(500).json({ error: 'Error interno en filtrado avanzado' });
  }
});



// 🧩 Obtener un producto por ID (con imágenes de referencia)
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conexion = await conectar();

    // 🔹 Datos principales del producto
    const [producto] = await conexion.query(`
      SELECT 
        p.id, 
        p.nombre, 
        p.descripcion, 
        p.precio, 
        p.stock, 
        p.imagen,
        c.nombre AS categoria,
        m.nombre AS marca,
        m.logo AS logo_marca,
        pr.nombre AS proveedor,
        p.ubicacion,
        p.fecha_ingreso
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?`, [id]);

    if (!producto.length) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // 🔹 Imágenes de referencia
    const [imagenes] = await conexion.query(
      'SELECT url_imagen FROM imagenes_referencia WHERE producto_id = ?',
      [id]
    );

    res.json({
      ...producto[0],
      imagenes_referencia: imagenes.map(i => i.url_imagen)
    });
  } catch (err) {
    console.error('🔥 ERROR al obtener producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📤 Subir imagen (productos, marcas o referencias)
app.post('/api/subir-imagen', upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const tipo = req.body.tipo || 'productos';
  const idElemento = req.body.id || null;
  const urlImagen = `http://localhost:3000/uploads/${tipo}/${req.file.filename}`;

  try {
    const conexion = await conectar();

    if (tipo === 'productos' && idElemento) {
      await conexion.execute('UPDATE productos SET imagen = ? WHERE id = ?', [urlImagen, idElemento]);
    } else if (tipo === 'marcas' && idElemento) {
      await conexion.execute('UPDATE marcas SET logo = ? WHERE id = ?', [urlImagen, idElemento]);
    } else if (tipo === 'imagenes_referencia' && idElemento) {
      await conexion.execute(
        'INSERT INTO imagenes_referencia (producto_id, url_imagen) VALUES (?, ?)',
        [idElemento, urlImagen]
      );
    }

    res.json({
      mensaje: `✅ Imagen subida correctamente a ${tipo}`,
      tipo,
      url: urlImagen
    });
  } catch (err) {
    console.error('🔥 ERROR al guardar imagen en la BD:', err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Servidor
app.listen(3000, () => {
  console.log('✅ Servidor ejecutándose en http://localhost:3000');
});
