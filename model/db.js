const { getRounds } = require('bcrypt');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'bgay1ut85jb6meygpwka-mysql.services.clever-cloud.com',       // dirección de tu servidor MySQL
    user: 'uji1yynbsormfj0c',      // usuario de MySQL
    password: 'h63OTz2O6w37J2NYvOCI', // contraseña de MySQL
    database: 'bgay1ut85jb6meygpwka', // Nombre de la base de datos
});

module.exports = db;
