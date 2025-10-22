const mysql = require('mysql2/promise');

const conexion = {
  host: 'localhost',
  user: 'root',
  password: 'soybatman89',  // 👈 reemplaza por tu clave real
  database: 'alphabike'
};

async function conectar() {
  try {
    const connection = await mysql.createConnection(conexion);
    console.log('✅ Conectado a MySQL correctamente');
    return connection;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
    throw error;
  }
}

module.exports = { conectar };
