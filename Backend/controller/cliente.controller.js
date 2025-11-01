
// Backend/controllers/cliente.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const ClienteController = {};
const CLIENTE_ROL_ID = 2; // El ID que asignamos al rol 'Cliente' en la BD

// 1. Obtener Clientes y Buscar (READ)
ClienteController.obtenerClientes = async (req, res) => {
    const searchTerm = req.query.search;

    try {
        let query = `
            SELECT 
                Id, NombreCompleto, Apellido, Correo, Telefono, FechaRegistro, Activo 
            FROM Usuarios 
            WHERE RolID = ?
        `;
        const params = [CLIENTE_ROL_ID];

        if (searchTerm) {
            query += ` AND (NombreCompleto LIKE ? OR Correo LIKE ?)`
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm);
        }
        
        query += ` ORDER BY FechaRegistro DESC`;
        
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ error: 'Error del servidor al listar clientes.' });
    }
};

// 2. Actualizar Estado (Activo/Inactivo) (UPDATE)
ClienteController.actualizarEstado = async (req, res) => {
    const clienteId = req.params.id;
    const { activo } = req.body;

    if (activo === undefined) {
        return res.status(400).json({ error: 'El campo activo es obligatorio.' });
    }
    
    try {
        const query = 'UPDATE Usuarios SET Activo = ? WHERE Id = ? AND RolID = ?';
        const values = [activo, clienteId, CLIENTE_ROL_ID];
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado o no tiene permisos para modificar este usuario.' });
        }

        const estadoTexto = activo ? 'activada' : 'desactivada';
        res.json({ mensaje: `Cuenta del cliente ${clienteId} ha sido ${estadoTexto}.` });

    } catch (err) {
        console.error('Error al actualizar estado del cliente:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar el estado.' });
    }
};

module.exports = ClienteController;
