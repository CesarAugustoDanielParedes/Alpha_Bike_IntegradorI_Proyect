// Backend/controllers/categoria.controller.js
const { conectar, sql } = require('../db'); 

const CategoriaController = {};

// 1. Obtener Categorías (READ - Para el Panel de Admin)
CategoriaController.obtenerTodas = async (req, res) => {
    try {
        const pool = await conectar();
        // Solo necesitamos el ID y el Nombre para gestión
        const result = await pool.request().query(`
            SELECT CategoriaID, Nombre, Descripcion 
            FROM Categorias 
            ORDER BY Nombre ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener Categorías:', err);
        res.status(500).json({ error: 'Error del servidor al listar categorías.' });
    }
};

// 2. Crear Categoría (CREATE)
CategoriaController.crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }

    try {
        const pool = await conectar();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.VarChar, descripcion || null)
            .query(`
                INSERT INTO Categorias (Nombre, Descripcion)
                VALUES (@nombre, @descripcion)
            `);

        res.status(201).json({ mensaje: 'Categoría creada exitosamente.' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE KEY')) {
            return res.status(409).json({ error: 'Esa categoría ya existe.' });
        }
        console.error('Error al crear categoría:', err);
        res.status(500).json({ error: 'Error del servidor al crear la categoría.' });
    }
};

// 3. Actualizar Categoría (UPDATE)
CategoriaController.actualizarCategoria = async (req, res) => {
    const categoriaId = req.params.id;
    const { nombre, descripcion } = req.body; 

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    }

    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('categoriaId', sql.Int, categoriaId)
            .input('nombre', sql.VarChar, nombre)
            .input('descripcion', sql.VarChar, descripcion || null)
            .query(`
                UPDATE Categorias SET 
                    Nombre = @nombre, 
                    Descripcion = @descripcion
                WHERE CategoriaID = @categoriaId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada para actualizar.' });
        }

        res.json({ mensaje: 'Categoría actualizada exitosamente.' });

    } catch (err) {
        if (err.message && err.message.includes('UNIQUE KEY')) {
            return res.status(409).json({ error: 'El nuevo nombre de categoría ya existe.' });
        }
        console.error('Error al actualizar categoría:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar la categoría.' });
    }
};

// 4. Eliminar Categoría (DELETE)
CategoriaController.eliminarCategoria = async (req, res) => {
    const categoriaId = req.params.id;

    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('categoriaId', sql.Int, categoriaId)
            .query(`DELETE FROM Categorias WHERE CategoriaID = @categoriaId`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada para eliminar.' });
        }

        res.json({ mensaje: 'Categoría eliminada exitosamente.' });

    } catch (err) {
        // Manejar el error de FK (si la categoría está en Productos)
        if (err.message && err.message.includes('FOREIGN KEY constraint')) {
            return res.status(409).json({ error: 'No se puede eliminar. Esta categoría está siendo usada por uno o más productos.' });
        }
        console.error('Error al eliminar categoría:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar la categoría.' });
    }
};

module.exports = CategoriaController;