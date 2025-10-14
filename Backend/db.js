
const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  database: 'AlphaBikeDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: true
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

async function conectar() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server');
    return pool;
  } catch (err) {
    console.error('❌ Error al conectar:', err);
    throw err;
  }
}

module.exports = { sql, conectar };
