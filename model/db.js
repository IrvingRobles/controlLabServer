const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'bygribkuoral2phomtxf-mysql.services.clever-cloud.com',       // dirección de tu servidor MySQL
    user: 'urddkyk6ocawom8c',      // usuario de MySQL
    password: 'wRvIpHcxmSAPnTeqL8D4', // contraseña de MySQL
    database: 'bygribkuoral2phomtxf', // Nombre de la base de datos
});

module.exports = db;
