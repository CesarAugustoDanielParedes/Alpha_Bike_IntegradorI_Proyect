// hash_generator.js
const bcrypt = require('bcryptjs'); // ⬅️ IMPORTANTE: Asegúrate que esta línea esté bien.

// Contraseña que queremos hashear
const plainPassword = 'admin1234'; 

// Generar el hash (el '10' es el número de rondas de sal)
const hash = bcrypt.hashSync(plainPassword, 10);

console.log('-----------------------------------------------------------');
console.log('HASH GENERADO (COPIA ESTO para tu SQL INSERT):');
console.log(hash); 
console.log('-----------------------------------------------------------');