const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',       // Cambia a la dirección de tu servidor MySQL
    user: 'root',            // Tu usuario de MySQL
    password: '',            // Tu contraseña de MySQL
    database: 'caltecmex2',      // Nombre de la base de datos
});

module.exports = db;
