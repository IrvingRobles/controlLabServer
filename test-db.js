const db = require('./model/db');

(async () => {
    try {
        const proveedores = await db.getProveedores();
        console.log('Proveedores:', proveedores);
    } catch (error) {
        console.error('Error en la conexión a la BD:', error);
    }
})();
