// Backend/controllers/cliente.controller.js
const { conectar, sql } = require('../db'); 

const ClienteController = {};
const CLIENTE_ROL_ID = 2; // El ID que asignamos al rol 'Cliente' en la BD

// 1. Obtener Clientes y Buscar (READ)
ClienteController.obtenerClientes = async (req, res) => {
    // Captura el parámetro de búsqueda
    const searchTerm = req.query.search; 

    try {
        const pool = await conectar();
        let query = `
            SELECT 
                Id, NombreCompleto, Apellido, Correo, Telefono, FechaRegistro, Activo 
            FROM Usuarios 
            WHERE RolID = @rolId
        `;
        
        // Aplicar filtro de búsqueda si existe
        if (searchTerm) {
            query += ` AND (NombreCompleto LIKE '%' + @searchTerm + '%' OR Correo LIKE '%' + @searchTerm + '%')`;
        }
        
        query += ` ORDER BY FechaRegistro DESC`;
        
        const request = pool.request();
        request.input('rolId', sql.Int, CLIENTE_ROL_ID);
        
        if (searchTerm) {
             request.input('searchTerm', sql.NVarChar, searchTerm);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ error: 'Error del servidor al listar clientes.' });
    }
};

// 2. Actualizar Estado (Activo/Inactivo) (UPDATE)
ClienteController.actualizarEstado = async (req, res) => {
    const clienteId = req.params.id;
    const { activo } = req.body; // Esperamos recibir el nuevo estado (true/false o 1/0)

    // Validación: solo se permite modificar el estado activo
    if (activo === undefined) {
        return res.status(400).json({ error: 'El campo activo es obligatorio.' });
    }
    
    // Asegurar que solo actualizamos clientes, no al admin
    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('activo', sql.Bit, activo)
            .input('rolId', sql.Int, CLIENTE_ROL_ID)
            .query(`
                UPDATE Usuarios 
                SET Activo = @activo
                WHERE Id = @clienteId AND RolID = @rolId
            `);

        if (result.rowsAffected[0] === 0) {
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