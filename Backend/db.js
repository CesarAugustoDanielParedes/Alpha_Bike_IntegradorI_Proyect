// Backend/db.js

const sql = require('mssql');

// Configuración de la conexión a SQL Server
const config = {
    server: 'BRADD\\SQLEXPRESS',
    port: 1433,
    database: 'AlphaBikeDB',
    user: 'sas',
    options: {
        // Estas opciones son correctas para un entorno de desarrollo local con SQL Server Express/Developer
        encrypt: false, 
        trustServerCertificate: true, 
        trustedConnection: true // Usando autenticación de Windows
    },
    // Configuración del Pool: define cuántas conexiones se mantienen abiertas
    pool: { 
        max: 10, 
        min: 0, 
        idleTimeoutMillis: 30000 
    }
};

// Variable para almacenar la conexión del pool (Singleton)
let pool; 

/**
 * Función para conectar o devolver la conexión existente del pool.
 * Esto evita crear un nuevo pool en cada llamada a la API.
 */
async function conectar() {
    if (pool && pool.connected) {
        // Si el pool ya existe y está conectado, devolverlo inmediatamente
        return pool;
    }

    try {
        // Conectar y almacenar la conexión en la variable pool
        pool = await sql.connect(config);
        console.log('✅ Conectado a SQL Server (Pool establecido)');
        
        // Manejar errores de desconexión futura
        pool.on('error', err => {
            console.error('❌ Error fatal del pool de SQL Server:', err);
            // Si hay un error, el pool se marcará como desconectado
        });
        
        return pool;
    } catch (err) {
        console.error('❌ Error al conectar a SQL Server:', err);
        throw new Error('No se pudo establecer la conexión con la base de datos.');
    }
}

// Exportar tanto el objeto 'sql' (para los tipos de datos) como la función 'conectar'
module.exports = { sql, conectar };