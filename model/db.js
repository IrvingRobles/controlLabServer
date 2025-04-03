const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'bf7gchwsnq8qdjrroxwg-mysql.services.clever-cloud.com',       // dirección de tu servidor MySQL
    user: 'uaioyc05nizrr2iw',      // usuario de MySQL
    password: 'pGQtUIYobiEfGZTggEqn', // contraseña de MySQL
    database: 'bf7gchwsnq8qdjrroxwg', // Nombre de la base de datos
});

module.exports = db;
