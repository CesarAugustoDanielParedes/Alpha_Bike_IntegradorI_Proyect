// Backend/controllers/banner.controller.js

const { conectar, sql } = require('../db'); 

const BannerController = {};

// -------------------------------------------------------------
// 1. LECTURA DE GESTIÓN (GET /api/admin/banners) - ADMIN
// Muestra TODOS los banners (activos e inactivos) para el panel de administración.
// -------------------------------------------------------------
BannerController.obtenerTodos = async (req, res) => {
    try {
        const pool = await conectar();
        const result = await pool.request().query(`
            SELECT BannerID, Titulo, ImagenURL, URLDestino, Orden, Activo 
            FROM Banners 
            ORDER BY Orden ASC, BannerID DESC
        `);
        // Devuelve el array de banners
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener banners:', err);
        res.status(500).json({ error: 'Error del servidor al listar banners.' });
    }
};

// -------------------------------------------------------------
// 2. LECTURA PÚBLICA (GET /api/banners) - CLIENTE
// Muestra solo banners ACTIVOS para la página de inicio. (Sincronización)
// -------------------------------------------------------------
BannerController.obtenerActivos = async (req, res) => {
    try {
        const pool = await conectar();
        // 🚨 CLAVE: Filtrar solo banners activos (Activo = 1)
        const result = await pool.request().query(`
            SELECT Titulo, ImagenURL, URLDestino, Orden 
            FROM Banners 
            WHERE Activo = 1 
            ORDER BY Orden ASC
        `);
        // Devuelve el array de banners activos
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener banners activos:', err);
        res.status(500).json({ error: 'Error del servidor al obtener banners públicos.' });
    }
};

// -------------------------------------------------------------
// 3. CREACIÓN (POST /api/admin/banners)
// -------------------------------------------------------------
BannerController.crearBanner = async (req, res) => {
    const { titulo, imagenUrl, urlDestino, orden, activo } = req.body;

    if (!titulo || !imagenUrl) {
        return res.status(400).json({ error: 'Título e ImagenURL son obligatorios.' });
    }

    try {
        const pool = await conectar();
        await pool.request()
            .input('titulo', sql.NVarChar, titulo)
            .input('imagenUrl', sql.VarChar, imagenUrl)
            .input('urlDestino', sql.VarChar, urlDestino || null)
            .input('orden', sql.Int, orden || 0)
            .input('activo', sql.Bit, activo) // Recibe true/false del frontend
            .query(`
                INSERT INTO Banners (Titulo, ImagenURL, URLDestino, Orden, Activo)
                VALUES (@titulo, @imagenUrl, @urlDestino, @orden, @activo)
            `);

        res.status(201).json({ mensaje: 'Banner creado exitosamente y disponible en la web si está activo.' });
    } catch (err) {
        console.error('Error al crear banner:', err);
        res.status(500).json({ error: 'Error del servidor al crear el banner.' });
    }
};

// -------------------------------------------------------------
// 4. ACTUALIZACIÓN (PUT /api/admin/banners/:id)
// -------------------------------------------------------------
BannerController.actualizarBanner = async (req, res) => {
    const bannerId = req.params.id;
    const { titulo, imagenUrl, urlDestino, orden, activo } = req.body; 

    // Validaciones mínimas
    if (!titulo || activo === undefined) { 
        return res.status(400).json({ error: 'Título y estado Activo son obligatorios para actualizar.' });
    }

    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('bannerId', sql.Int, bannerId)
            .input('titulo', sql.NVarChar, titulo)
            .input('imagenUrl', sql.VarChar, imagenUrl)
            .input('urlDestino', sql.VarChar, urlDestino || null)
            .input('orden', sql.Int, orden || 0)
            .input('activo', sql.Bit, activo)
            .query(`
                UPDATE Banners SET 
                    Titulo = @titulo, 
                    ImagenURL = @imagenUrl, 
                    URLDestino = @urlDestino, 
                    Orden = @orden, 
                    Activo = @activo
                WHERE BannerID = @bannerId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Banner no encontrado.' });
        }

        res.json({ mensaje: 'Banner actualizado exitosamente. El cambio se refleja en la web.' });

    } catch (err) {
        console.error('Error al actualizar banner:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar el banner.' });
    }
};

// -------------------------------------------------------------
// 5. ELIMINACIÓN (DELETE /api/admin/banners/:id)
// -------------------------------------------------------------
BannerController.eliminarBanner = async (req, res) => {
    const bannerId = req.params.id;

    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('bannerId', sql.Int, bannerId)
            .query(`DELETE FROM Banners WHERE BannerID = @bannerId`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Banner no encontrado para eliminar.' });
        }

        res.json({ mensaje: 'Banner eliminado exitosamente.' });

    } catch (err) {
        console.error('Error al eliminar banner:', err);
        res.status(500).json({ error: 'Error del servidor al eliminar el banner.' });
    }
};

module.exports = BannerController;