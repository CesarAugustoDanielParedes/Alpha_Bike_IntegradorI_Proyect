
// Backend/controllers/categoria.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const CategoriaController = {};

// 1. Obtener Categorías (READ)
CategoriaController.obtenerTodas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT CategoriaID, Nombre, Descripcion 
            FROM Categorias 
            ORDER BY Nombre ASC
        `);
        res.json(rows);
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
        const query = 'INSERT INTO Categorias (Nombre, Descripcion) VALUES (?, ?)';
        const values = [nombre, descripcion || null];
        await pool.query(query, values);
        res.status(201).json({ mensaje: 'Categoría creada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
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
        const query = 'UPDATE Categorias SET Nombre = ?, Descripcion = ? WHERE CategoriaID = ?';
        const values = [nombre, descripcion || null, categoriaId];
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada para actualizar.' });
        }

        res.json({ mensaje: 'Categoría actualizada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
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
        const [result] = await pool.query('DELETE FROM Categorias WHERE CategoriaID = ?', [categoriaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada para eliminar.' });
        }

        res.json({ mensaje: 'Categoría eliminada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: 'No se puede eliminar. Esta categoría está siendo usada por uno o más productos.' });
        }
        console.error('Error al eliminar categoría:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar la categoría.' });
    }
};

module.exports = CategoriaController;
