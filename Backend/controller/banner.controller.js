
// Backend/controllers/banner.controller.js (MIGRADO A MYSQL)

const pool = require('../db');

const BannerController = {};

// 1. LECTURA DE GESTIÓN (GET /api/admin/banners) - ADMIN
BannerController.obtenerTodos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT BannerID, Titulo, ImagenURL, URLDestino, Orden, Activo 
            FROM Banners 
            ORDER BY Orden ASC, BannerID DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener banners:', err);
        res.status(500).json({ error: 'Error del servidor al listar banners.' });
    }
};

// 2. LECTURA PÚBLICA (GET /api/banners) - CLIENTE
BannerController.obtenerActivos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT Titulo, ImagenURL, URLDestino, Orden 
            FROM Banners 
            WHERE Activo = 1 
            ORDER BY Orden ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener banners activos:', err);
        res.status(500).json({ error: 'Error del servidor al obtener banners públicos.' });
    }
};

// 3. CREACIÓN (POST /api/admin/banners)
BannerController.crearBanner = async (req, res) => {
    const { titulo, imagenUrl, urlDestino, orden, activo } = req.body;

    if (!titulo || !imagenUrl) {
        return res.status(400).json({ error: 'Título e ImagenURL son obligatorios.' });
    }

    try {
        const query = `
            INSERT INTO Banners (Titulo, ImagenURL, URLDestino, Orden, Activo)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [titulo, imagenUrl, urlDestino || null, orden || 0, activo];

        await pool.query(query, values);

        res.status(201).json({ mensaje: 'Banner creado exitosamente y disponible en la web si está activo.' });
    } catch (err) {
        console.error('Error al crear banner:', err);
        res.status(500).json({ error: 'Error del servidor al crear el banner.' });
    }
};

// 4. ACTUALIZACIÓN (PUT /api/admin/banners/:id)
BannerController.actualizarBanner = async (req, res) => {
    const bannerId = req.params.id;
    const { titulo, imagenUrl, urlDestino, orden, activo } = req.body;

    if (!titulo || activo === undefined) {
        return res.status(400).json({ error: 'Título y estado Activo son obligatorios para actualizar.' });
    }

    try {
        const query = `
            UPDATE Banners SET 
                Titulo = ?, 
                ImagenURL = ?, 
                URLDestino = ?, 
                Orden = ?, 
                Activo = ?
            WHERE BannerID = ?
        `;
        const values = [titulo, imagenUrl, urlDestino || null, orden || 0, activo, bannerId];

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Banner no encontrado.' });
        }

        res.json({ mensaje: 'Banner actualizado exitosamente. El cambio se refleja en la web.' });

    } catch (err) {
        console.error('Error al actualizar banner:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar el banner.' });
    }
};

// 5. ELIMINACIÓN (DELETE /api/admin/banners/:id)
BannerController.eliminarBanner = async (req, res) => {
    const bannerId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Banners WHERE BannerID = ?', [bannerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Banner no encontrado para eliminar.' });
        }

        res.json({ mensaje: 'Banner eliminado exitosamente.' });

    } catch (err) {
        console.error('Error al eliminar banner:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar el banner.' });
    }
};

module.exports = BannerController;
