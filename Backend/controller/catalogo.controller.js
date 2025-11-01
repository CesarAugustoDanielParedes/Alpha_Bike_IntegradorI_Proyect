
// Backend/controllers/catalogo.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const CatalogoController = {};

/**
 * @route GET /api/marcas
 * @desc Obtiene todas las marcas registradas en la base de datos.
 * @access Public
 */
CatalogoController.obtenerMarcas = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT MarcaID, Nombre FROM Marcas ORDER BY Nombre");
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener Marcas:', err);
        res.status(500).json({ error: 'Error del servidor al cargar marcas.' });
    }
};

/**
 * @route GET /api/categorias
 * @desc Obtiene todas las categorías registradas en la base de datos.
 * @access Public
 */
CatalogoController.obtenerCategorias = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CategoriaID, Nombre FROM Categorias ORDER BY Nombre");
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener Categorías:', err);
        res.status(500).json({ error: 'Error del servidor al cargar categorías.' });
    }
};

module.exports = CatalogoController;
