// Backend/controllers/producto.controller.js

const { conectar, sql } = require('../db'); 

const ProductoController = {};

// -------------------------------------------------------------
// 1. LECTURA PÚBLICA (GET /api/productos)
// Muestra solo productos ACTIVOS y con STOCK > 0. (Sincronización con el Cliente)
// -------------------------------------------------------------
ProductoController.obtenerDisponibles = async (req, res) => {
    try {
        const pool = await conectar();
        
        // Consulta filtrada y unida para el frontend público
        const result = await pool.request().query(`
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
        `);

        // 🚨 CLAVE: Devuelve solo la matriz de resultados (recordset)
        res.json(result.recordset); 
    } catch (err) {
        console.error('Error al obtener productos públicos:', err);
        res.status(500).json({ error: 'Error del servidor al obtener el catálogo.' });
    }
};

// -------------------------------------------------------------
// 2. LECTURA DE GESTIÓN (GET /api/admin/productos?search=...)
// Muestra TODOS los productos (activos e inactivos) para el panel.
// -------------------------------------------------------------
ProductoController.obtenerTodos = async (req, res) => {
    // Lógica de Búsqueda: Captura el parámetro 'search' (si existe)
    const searchTerm = req.query.search; 

    try {
        const pool = await conectar();
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
        
        // Aplicar filtro de búsqueda si se proporciona el término
        if (searchTerm) {
            query += ` WHERE p.Nombre LIKE '%' + @searchTerm + '%' 
                        OR p.SKU LIKE '%' + @searchTerm + '%' `;
        }
        
        query += ` ORDER BY p.ProductoID DESC`;
        
        const request = pool.request();
        if (searchTerm) {
             request.input('searchTerm', sql.NVarChar, searchTerm);
        }

        const result = await request.query(query);

        // 🚨 CLAVE: Devuelve solo la matriz de resultados (recordset)
        res.json(result.recordset); 
    } catch (err) {
        console.error('Error al obtener productos para Admin:', err);
        // Si el error es de conexión o de lógica, devolvemos un 500
        res.status(500).json({ error: 'Error del servidor al listar productos.' });
    }
};


// -------------------------------------------------------------
// 3. CREACIÓN (POST /api/admin/productos)
// -------------------------------------------------------------
ProductoController.crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock, sku, categoriaId, marcaId, imagenUrl } = req.body;

    // Validación básica
    if (!nombre || !precio || !stock || !sku || !categoriaId || !marcaId) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el producto.' });
    }
    
    // Convertir y validar tipos numéricos
    const parsedPrecio = parseFloat(precio);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrecio) || isNaN(parsedStock) || parsedPrecio <= 0 || parsedStock < 0) {
         return res.status(400).json({ error: 'Precio o Stock tienen valores inválidos.' });
    }

    try {
        const pool = await conectar();
        
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('descripcion', sql.Text, descripcion)
            .input('precio', sql.Decimal(10, 2), parsedPrecio)
            .input('stock', sql.Int, parsedStock)
            .input('sku', sql.VarChar, sku)
            .input('categoriaId', sql.Int, categoriaId)
            .input('marcaId', sql.Int, marcaId)
            .input('imagenUrl', sql.VarChar, imagenUrl || null)
            .query(`
                INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, SKU, CategoriaID, MarcaID, ImagenURL, Activo, FechaCreacion)
                VALUES (@nombre, @descripcion, @precio, @stock, @sku, @categoriaId, @marcaId, @imagenUrl, 1, GETDATE())
            `);

        res.status(201).json({ mensaje: 'Producto creado exitosamente y ya está disponible.' });

    } catch (err) {
        console.error('Error al crear producto:', err);
        if (err.message && err.message.includes('UNIQUE KEY')) {
            return res.status(409).json({ error: 'El SKU ya existe. Por favor, use otro.' });
        }
        res.status(500).json({ error: 'Error del servidor al crear el producto.' });
    }
};


// -------------------------------------------------------------
// 4. ACTUALIZACIÓN (PUT /api/admin/productos/:id)
// -------------------------------------------------------------
ProductoController.actualizarProducto = async (req, res) => {
    const productoId = req.params.id;
    const { nombre, descripcion, precio, stock, sku, categoriaId, marcaId, imagenUrl, activo } = req.body;

    // Validación básica
    if (!nombre || !precio || !stock || !sku || !categoriaId || !marcaId || activo === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para la actualización.' });
    }

    try {
        const pool = await conectar();
        
        const result = await pool.request()
            .input('productoId', sql.Int, productoId)
            .input('nombre', sql.NVarChar, nombre)
            .input('descripcion', sql.Text, descripcion)
            .input('precio', sql.Decimal(10, 2), parseFloat(precio))
            .input('stock', sql.Int, parseInt(stock))
            .input('sku', sql.VarChar, sku)
            .input('categoriaId', sql.Int, parseInt(categoriaId))
            .input('marcaId', sql.Int, parseInt(marcaId))
            .input('imagenUrl', sql.VarChar, imagenUrl || null)
            .input('activo', sql.Bit, activo)
            .query(`
                UPDATE Productos SET 
                    Nombre = @nombre, 
                    Descripcion = @descripcion, 
                    Precio = @precio, 
                    Stock = @stock, 
                    SKU = @sku, 
                    CategoriaID = @categoriaId, 
                    MarcaID = @marcaId, 
                    ImagenURL = @imagenUrl, 
                    Activo = @activo
                WHERE ProductoID = @productoId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para actualizar.' });
        }

        res.json({ mensaje: 'Producto actualizado exitosamente. Los cambios se reflejan en la tienda.' });

    } catch (err) {
        console.error('Error al actualizar producto:', err);
        // Si el SKU se intenta duplicar con otro producto existente
        if (err.message && err.message.includes('UNIQUE KEY')) {
            return res.status(409).json({ error: 'El SKU ya existe en otro producto.' });
        }
        res.status(500).json({ error: 'Error del servidor al actualizar el producto.' });
    }
};


// -------------------------------------------------------------
// 5. ELIMINACIÓN (DELETE /api/admin/productos/:id)
// -------------------------------------------------------------
ProductoController.eliminarProducto = async (req, res) => {
    const productoId = req.params.id;

    try {
        const pool = await conectar();
        
        const result = await pool.request()
            .input('productoId', sql.Int, productoId)
            .query(`DELETE FROM Productos WHERE ProductoID = @productoId`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para eliminar.' });
        }

        res.json({ mensaje: 'Producto eliminado exitosamente.' });

    } catch (err) {
        // Manejar error si el producto ya tiene registros en DetallePedido (FK violation)
        if (err.message && err.message.includes('FOREIGN KEY constraint')) {
            return res.status(409).json({ error: 'No se puede eliminar. El producto tiene pedidos asociados.' });
        }
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar el producto.' });
    }
};


module.exports = ProductoController;