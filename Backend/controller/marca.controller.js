// Backend/controllers/marca.controller.js
const { conectar, sql } = require('../db'); 

const MarcaController = {};

// 1. Obtener Marcas (READ - Para el Panel de Admin)
MarcaController.obtenerTodas = async (req, res) => {
    try {
        const pool = await conectar();
        // Incluimos LogoURL si fuera necesario
        const result = await pool.request().query(`
            SELECT MarcaID, Nombre, LogoURL 
            FROM Marcas 
            ORDER BY Nombre ASC
        `);
        res.json(result.recordset);
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
        const pool = await conectar();
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('logoUrl', sql.VarChar, logoUrl || null)
            .query(`
                INSERT INTO Marcas (Nombre, LogoURL)
                VALUES (@nombre, @logoUrl)
            `);

        res.status(201).json({ mensaje: 'Marca creada exitosamente.' });
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE KEY')) {
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
        const pool = await conectar();
        const result = await pool.request()
            .input('marcaId', sql.Int, marcaId)
            .input('nombre', sql.VarChar, nombre)
            .input('logoUrl', sql.VarChar, logoUrl || null)
            .query(`
                UPDATE Marcas SET 
                    Nombre = @nombre, 
                    LogoURL = @logoUrl
                WHERE MarcaID = @marcaId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Marca no encontrada para actualizar.' });
        }

        res.json({ mensaje: 'Marca actualizada exitosamente.' });

    } catch (err) {
        if (err.message && err.message.includes('UNIQUE KEY')) {
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
        const pool = await conectar();
        const result = await pool.request()
            .input('marcaId', sql.Int, marcaId)
            .query(`DELETE FROM Marcas WHERE MarcaID = @marcaId`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Marca no encontrada para eliminar.' });
        }

        res.json({ mensaje: 'Marca eliminada exitosamente.' });

    } catch (err) {
        // Manejar el error de FK (si la marca está en Productos)
        if (err.message && err.message.includes('FOREIGN KEY constraint')) {
            return res.status(409).json({ error: 'No se puede eliminar. Esta marca está siendo usada por uno o más productos.' });
        }
        console.error('Error al eliminar marca:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar la marca.' });
    }
};

module.exports = MarcaController;