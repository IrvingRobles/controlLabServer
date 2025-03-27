const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
<<<<<<< HEAD
    host: 'bf7gchwsnq8qdjrroxwg-mysql.services.clever-cloud.com',       // dirección de tu servidor MySQL
    user: 'uaioyc05nizrr2iw',      // usuario de MySQL
    password: 'pGQtUIYobiEfGZTggEqn', // contraseña de MySQL
    database: 'bf7gchwsnq8qdjrroxwg', // Nombre de la base de datos
=======
    host: 'localhost',       // Cambia a la dirección de tu servidor MySQL
    user: 'root',            // Tu usuario de MySQL
    password: '',            // Tu contraseña de MySQL
    database: 'caltecmex2',      // Nombre de la base de datos
>>>>>>> desarrollo-c4
});

module.exports = db;
