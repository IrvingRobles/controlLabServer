const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

// Crear el pool de conexiones
const db = mysql.createPool({
    host: 'localhost',       // Cambia a la dirección de tu servidor MySQL
<<<<<<< HEAD
    user: 'root',            // Tu usuario de MySQL
    password: '',            // Tu contraseña de MySQL
    database: 'prueba',      // Nombre de la base de datos
=======
    user: 'root',      // Tu usuario de MySQL
    password: '', // Tu contraseña de MySQL
    database: 'caltecmex', // Nombre de la base de datos
>>>>>>> cb88d9b (coomitC1)
});

module.exports = db;
