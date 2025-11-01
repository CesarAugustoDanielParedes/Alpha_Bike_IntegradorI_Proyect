
// Backend/controllers/marca.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const MarcaController = {};

// 1. Obtener Marcas (READ)
MarcaController.obtenerTodas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT MarcaID, Nombre, LogoURL 
            FROM Marcas 
            ORDER BY Nombre ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener Marcas:', err);
        res.status(500).json({ error: 'Error del servidor al listar marcas.' });
    }
};

// 2. Crear Marca (CREATE)
MarcaController.crearMarca = async (req, res) => {
    const { nombre, logoUrl } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la marca es obligatorio.' });
    }

    try {
        const query = 'INSERT INTO Marcas (Nombre, LogoURL) VALUES (?, ?)';
        const values = [nombre, logoUrl || null];
        await pool.query(query, values);
        res.status(201).json({ mensaje: 'Marca creada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Esa marca ya existe.' });
        }
        console.error('Error al crear marca:', err);
        res.status(500).json({ error: 'Error del servidor al crear la marca.' });
    }
};

// 3. Actualizar Marca (UPDATE)
MarcaController.actualizarMarca = async (req, res) => {
    const marcaId = req.params.id;
    const { nombre, logoUrl } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la marca es obligatorio.' });
    }

    try {
        const query = 'UPDATE Marcas SET Nombre = ?, LogoURL = ? WHERE MarcaID = ?';
        const values = [nombre, logoUrl || null, marcaId];
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Marca no encontrada para actualizar.' });
        }

        res.json({ mensaje: 'Marca actualizada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El nuevo nombre de marca ya existe.' });
        }
        console.error('Error al actualizar marca:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar la marca.' });
    }
};

// 4. Eliminar Marca (DELETE)
MarcaController.eliminarMarca = async (req, res) => {
    const marcaId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Marcas WHERE MarcaID = ?', [marcaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Marca no encontrada para eliminar.' });
        }

        res.json({ mensaje: 'Marca eliminada exitosamente.' });
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: 'No se puede eliminar. Esta marca está siendo usada por uno o más productos.' });
        }
        console.error('Error al eliminar marca:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar la marca.' });
    }
};

module.exports = MarcaController;
