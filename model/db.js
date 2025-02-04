/*const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',       // Cambia a la dirección de tu servidor MySQL
    user: 'root',      // Tu usuario de MySQL
    password: '', // Tu contraseña de MySQL
    database: 'caltecmex', // Nombre de la base de datos
});

module.exports = db;*/
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'caltecmex'
});