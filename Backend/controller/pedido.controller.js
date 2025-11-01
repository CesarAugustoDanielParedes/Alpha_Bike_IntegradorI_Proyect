
// Backend/controllers/pedido.controller.js (MIGRADO A MYSQL)
const pool = require('../db');

const PedidoController = {};

// 1. Listar Pedidos (READ)
PedidoController.obtenerPedidos = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.PedidoID, p.FechaPedido, p.Total, p.Estado, p.DireccionEnvio, p.MetodoPago,
                u.NombreCompleto AS ClienteNombre, u.Correo AS ClienteCorreo
            FROM Pedidos p
            JOIN Usuarios u ON p.UsuarioID = u.Id
            ORDER BY p.FechaPedido DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error del servidor al listar pedidos.' });
    }
};

// 2. Actualizar Estado del Pedido (UPDATE)
PedidoController.actualizarEstado = async (req, res) => {
    const pedidoId = req.params.id;
    const { nuevoEstado } = req.body;

    if (!nuevoEstado) {
        return res.status(400).json({ error: 'El campo nuevoEstado es obligatorio.' });
    }

    try {
        const query = 'UPDATE Pedidos SET Estado = ? WHERE PedidoID = ?';
        const [result] = await pool.query(query, [nuevoEstado, pedidoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado para actualizar.' });
        }

        res.json({ mensaje: `Estado del pedido ${pedidoId} actualizado a "${nuevoEstado}".` });

    } catch (err) {
        console.error('Error al actualizar estado del pedido:', err);
        res.status(500).json({ error: 'Error del servidor al actualizar el estado.' });
    }
};

module.exports = PedidoController;
