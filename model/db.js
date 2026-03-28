const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'bwjd5ohuyklwulyyxklo-mysql.services.clever-cloud.com',       // dirección de tu servidor MySQL
    user: 'u6ieiv1oujeudcll',      // usuario de MySQL
    password: 'Y0sfZ0jwG2BBUyLsaOXI', // contraseña de MySQL
    database: 'bwjd5ohuyklwulyyxklo', // Nombre de la base de datos
});

module.exports = db;
