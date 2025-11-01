
// Backend/db.js
const mysql = require('mysql2/promise');

// Configuración de la conexión a MySQL
const config = {
    host: 'localhost',
    user: 'root',
    password: '12345', // <-- ¡REEMPLAZA ESTO CON TU CONTRASEÑA REAL DE MYSQL!
    password: '', // <-- ¡REEMPLAZA ESTO CON TU CONTRASEÑA REAL DE MYSQL!
    database: 'AlphaBikeDB', // NOMBRE DE LA BASE DE DATOS
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear el pool de conexiones
const pool = mysql.createPool(config);

// Función para probar la conexión al iniciar
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL (Pool establecido)');
        connection.release(); // Devolver la conexión al pool
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error);
        // Si hay un error, el proceso se detendrá, ya que la BD es crucial.
        process.exit(1);
    }
}

// Probar la conexión una vez al inicio del módulo
testConnection();

// Exportar el pool para que pueda ser usado en los controladores
module.exports = pool;
