// Backend/controllers/pedido.controller.js
const { conectar, sql } = require('../db'); 

const PedidoController = {};

// 1. Listar Pedidos (READ)
// Lógica: Une Pedidos con Usuarios para mostrar quién compró y muestra el estado actual.
PedidoController.obtenerPedidos = async (req, res) => {
    try {
        const pool = await conectar();
        const result = await pool.request().query(`
            SELECT 
                p.PedidoID, p.FechaPedido, p.Total, p.Estado, p.DireccionEnvio, p.MetodoPago,
                u.NombreCompleto AS ClienteNombre, u.Correo AS ClienteCorreo
            FROM Pedidos p
            JOIN Usuarios u ON p.UsuarioID = u.Id
            ORDER BY p.FechaPedido DESC
        `);
        // Devuelve la lista de pedidos al administrador
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error del servidor al listar pedidos.' });
    }
};

// 2. Actualizar Estado del Pedido (UPDATE)
// Lógica: Permite al administrador cambiar el campo 'Estado' del pedido.
PedidoController.actualizarEstado = async (req, res) => {
    const pedidoId = req.params.id;
    const { nuevoEstado } = req.body; // Esperamos recibir el nuevo estado ('En Proceso', 'Enviado', etc.)

    if (!nuevoEstado) {
        return res.status(400).json({ error: 'El campo nuevoEstado es obligatorio.' });
    }

    try {
        const pool = await conectar();
        const result = await pool.request()
            .input('pedidoId', sql.Int, pedidoId)
            .input('nuevoEstado', sql.VarChar, nuevoEstado)
            .query(`
                UPDATE Pedidos 
                SET Estado = @nuevoEstado
                WHERE PedidoID = @pedidoId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado para actualizar.' });
        }

        res.json({ mensaje: `Estado del pedido ${pedidoId} actualizado a "${nuevoEstado}".` });

    } catch (err) {
        console.error('Error al actualizar estado del pedido:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar el estado.' });
    }
};

module.exports = PedidoController;