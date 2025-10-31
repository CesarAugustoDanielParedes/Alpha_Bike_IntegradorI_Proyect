// Backend/controllers/catalogo.controller.js
const { conectar, sql } = require('../db'); 

const CatalogoController = {};

/**
 * @route GET /api/marcas
 * @desc Obtiene todas las marcas registradas en la base de datos.
 * @access Public (usada por el Admin para formularios y por el cliente si se implementa filtro)
 */
CatalogoController.obtenerMarcas = async (req, res) => {
    try {
        const pool = await conectar();
        
        // Solo necesitamos el ID y el Nombre para los dropdowns
        const result = await pool.request().query("SELECT MarcaID, Nombre FROM Marcas ORDER BY Nombre");
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener Marcas:', err);
        // Devolvemos un 500 si falla la conexión o la consulta
        res.status(500).json({ error: 'Error del servidor al cargar marcas.' });
    }
};

/**
 * @route GET /api/categorias
 * @desc Obtiene todas las categorías registradas en la base de datos.
 * @access Public (usada por el Admin para formularios)
 */
CatalogoController.obtenerCategorias = async (req, res) => {
    try {
        const pool = await conectar();
        
        // Solo necesitamos el ID y el Nombre
        const result = await pool.request().query("SELECT CategoriaID, Nombre FROM Categorias ORDER BY Nombre");
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener Categorías:', err);
        res.status(500).json({ error: 'Error del servidor al cargar categorías.' });
    }
};

module.exports = CatalogoController;