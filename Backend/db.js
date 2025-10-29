const sql = require('mssql');
require('dotenv').config();

const useMsNodeSqlv8 = process.env.DB_DRIVER === 'msnodesqlv8';

let config;

if (useMsNodeSqlv8) {

  config = {
    driver: 'msnodesqlv8',
    connectionString: process.env.DB_CONNECTIONSTRING || "Server=localhost;Database=AlphaBikeDB;Trusted_Connection=Yes;"
  };
} else {

  config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456789',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'AlphaBikeDB',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
      instanceName: 'SQLEXPRESS',
      encrypt: false,
      trustServerCertificate: true
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
}

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