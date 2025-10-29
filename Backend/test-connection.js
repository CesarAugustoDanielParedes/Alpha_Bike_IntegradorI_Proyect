const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456789',
  server: 'localhost', 
  database: 'AlphaBikeDB',     
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    let pool = await sql.connect(config);
    console.log('✅ Conectado a SQL Server');
    let result = await pool.request().query('SELECT GETDATE() AS Fecha');
    console.log(result.recordset);
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
