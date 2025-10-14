const express = require('express');
const cors = require('express');
const { conectar, sql } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta registro
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  try {
    const pool = await conectar();
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('correo', sql.NVarChar, correo)
      .input('contrasena', sql.NVarChar, contrasena)
      .query('INSERT INTO Usuarios (NombreCompleto, Correo, Contrasena) VALUES (@nombre, @correo, @contrasena)');
    res.json({ mensaje: 'Usuario registrado' });
  } catch (err) {
    console.error('🔥 ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/productos', async (req, res) => {
  const pool = await conectar();
  const result = await pool.request().query('SELECT * FROM Productos');
  res.json(result.recordset);
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'))