
// Backend/controllers/producto.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const ProductoController = {};

// 1. LECTURA PÚBLICA (GET /api/productos)
ProductoController.obtenerDisponibles = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.ProductoID AS id, 
                p.Nombre AS nombre, 
                p.Precio AS precio, 
                p.ImagenURL AS imagen, 
                p.Stock, 
                m.Nombre AS marca,
                m.LogoURL AS logo, 
                c.Nombre AS categoria
            FROM Productos p
            JOIN Marcas m ON p.MarcaID = m.MarcaID
            JOIN Categorias c ON p.CategoriaID = c.CategoriaID
            WHERE p.Activo = 1 AND p.Stock > 0 
            ORDER BY p.FechaCreacion DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos públicos:', err);
        res.status(500).json({ error: 'Error del servidor al obtener el catálogo.' });
    }
};

// 2. LECTURA DE GESTIÓN (GET /api/admin/productos?search=...)
ProductoController.obtenerTodos = async (req, res) => {
    const searchTerm = req.query.search;

    try {
        let query = `
            SELECT 
                p.ProductoID, p.SKU, p.Nombre, p.Descripcion, 
                p.Precio, p.Stock, p.ImagenURL, p.Activo,
                c.Nombre AS CategoriaNombre, m.Nombre AS MarcaNombre,
                p.CategoriaID, p.MarcaID 
            FROM Productos p
            JOIN Categorias c ON p.CategoriaID = c.CategoriaID
            JOIN Marcas m ON p.MarcaID = m.MarcaID
        `;
        const params = [];

        if (searchTerm) {
            query += ` WHERE p.Nombre LIKE ? OR p.SKU LIKE ? `;
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm);
        }
        
        query += ` ORDER BY p.ProductoID DESC`;
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener productos para Admin:', err);
        res.status(500).json({ error: 'Error del servidor al listar productos.' });
    }
};

// 3. CREACIÓN (POST /api/admin/productos)
ProductoController.crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock, sku, categoriaId, marcaId, imagenUrl } = req.body;

    if (!nombre || !precio || !stock || !sku || !categoriaId || !marcaId) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el producto.' });
    }
    
    const parsedPrecio = parseFloat(precio);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrecio) || isNaN(parsedStock) || parsedPrecio <= 0 || parsedStock < 0) {
         return res.status(400).json({ error: 'Precio o Stock tienen valores inválidos.' });
    }

    try {
        const query = `
            INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, SKU, CategoriaID, MarcaID, ImagenURL, Activo, FechaCreacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
        `;
        const values = [nombre, descripcion, parsedPrecio, parsedStock, sku, categoriaId, marcaId, imagenUrl || null];
        
        await pool.query(query, values);

        res.status(201).json({ mensaje: 'Producto creado exitosamente y ya está disponible.' });

    } catch (err) {
        console.error('Error al crear producto:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El SKU ya existe. Por favor, use otro.' });
        }
        res.status(500).json({ error: 'Error del servidor al crear el producto.' });
    }
};

// 4. ACTUALIZACIÓN (PUT /api/admin/productos/:id)
ProductoController.actualizarProducto = async (req, res) => {
    const productoId = req.params.id;
    const { nombre, descripcion, precio, stock, sku, categoriaId, marcaId, imagenUrl, activo } = req.body;

    if (!nombre || !precio || !stock || !sku || !categoriaId || !marcaId || activo === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para la actualización.' });
    }

    try {
        const query = `
            UPDATE Productos SET 
                Nombre = ?, Descripcion = ?, Precio = ?, Stock = ?, SKU = ?, 
                CategoriaID = ?, MarcaID = ?, ImagenURL = ?, Activo = ?
            WHERE ProductoID = ?
        `;
        const values = [
            nombre, descripcion, parseFloat(precio), parseInt(stock), sku, 
            parseInt(categoriaId), parseInt(marcaId), imagenUrl || null, activo, productoId
        ];

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para actualizar.' });
        }

        res.json({ mensaje: 'Producto actualizado exitosamente. Los cambios se reflejan en la tienda.' });

    } catch (err) {
        console.error('Error al actualizar producto:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El SKU ya existe en otro producto.' });
        }
        res.status(500).json({ error: 'Error del servidor al actualizar el producto.' });
    }
};

// 5. ELIMINACIÓN (DELETE /api/admin/productos/:id)
ProductoController.eliminarProducto = async (req, res) => {
    const productoId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Productos WHERE ProductoID = ?', [productoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para eliminar.' });
        }

        res.json({ mensaje: 'Producto eliminado exitosamente.' });

    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: 'No se puede eliminar. El producto tiene pedidos asociados.' });
        }
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar el producto.' });
    }
};

module.exports = ProductoController;
