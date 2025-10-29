const express = require('express');
const cors = require('cors');
const path = require('path');
const { conectar, sql } = require('./db');

const app = express();
app.use(cors({ }));

app.use(express.json());


app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Ruta registro
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

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
  try {
    const pool = await conectar();
    const result = await pool.request().query('SELECT * FROM Productos');
    res.json(result.recordset);
  } catch (err) {
    console.error('🔥 ERROR Productos:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

// Ruta login
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Faltan correo o contraseña' });
  }

  try {
    const pool = await conectar();
    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .input('contrasena', sql.NVarChar, contrasena)
      .query('SELECT * FROM Usuarios WHERE Correo = @correo AND Contrasena = @contrasena');

    if (result.recordset.length > 0) {
      res.json({ mensaje: 'Inicio de sesión correcto', usuario: result.recordset[0] });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (err) {
    console.error('🔥 ERROR LOGIN:', err);
    res.status(500).json({ error: err.message });
  }
});
// Usuarios para panel admin
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const pool = await conectar();
    const result = await pool.request().query('SELECT Id, NombreCompleto, Correo FROM Usuarios');
    res.json(result.recordset);
  } catch (err) {
    console.error('🔥 ERROR Usuarios:', err);
    res.status(500).json({ error: err.message });
  }
});

// Productos
app.get('/api/admin/productos', async (req, res) => {
  try {
    const pool = await conectar();
    const result = await pool.request().query('SELECT Id, Nombre, Precio, Stock FROM Productos');
    res.json(result.recordset);
  } catch (err) {
    console.error('🔥 ERROR Productos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Pedidos
app.get('/api/admin/pedidos', async (req, res) => {
  try {
    const pool = await conectar();
    const result = await pool.request().query('SELECT Id, UsuarioId, Estado, Fecha FROM Pedidos');
    res.json(result.recordset);
  } catch (err) {
    console.error('🔥 ERROR Pedidos:', err);
    res.status(500).json({ error: err.message });
  }
});
