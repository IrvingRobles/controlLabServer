const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',       // dirección de tu servidor MySQL
    user: 'root',      // usuario de MySQL
    password: '', // contraseña de MySQL
    database: 'caltecmex', // Nombre de la base de datos
});

module.exports = db;
