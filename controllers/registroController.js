const db = require('../model/db'); // Configuración de la base de datos (ver explicación al final)

// Crear un nuevo registro
exports.crearRegistro = async (req, res) => {
    const { clave, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado } = req.body;

    try {
        const query = `
            INSERT INTO registros (clave, empresa, fecha_envio, descripcion, contacto, importe_cotizado, resultado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [clave, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado];

        const [result] = await db.execute(query, values);

        res.status(201).json({
            mensaje: 'Registro creado con éxito',
            registroId: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el registro', error });
    }
};

// Obtener todos los registros
exports.obtenerRegistros = async (req, res) => {
    try {
        const query = 'SELECT * FROM registros';
        const [registros] = await db.execute(query);

        res.json({ mensaje: 'Registros obtenidos', registros });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros', error });
    }
};

// Obtener un registro por ID
exports.obtenerRegistroPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM registros WHERE id = ?';
        const [registros] = await db.execute(query, [id]);

        if (registros.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro obtenido', registro: registros[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el registro', error });
    }
};

// Actualizar un registro por ID
exports.actualizarRegistro = async (req, res) => {
    const { id } = req.params;
    const { clave, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado } = req.body;

    try {
        const query = `
            UPDATE registros
            SET clave = ?, empresa = ?, fecha_envio = ?, descripcion = ?, contacto = ?, importe_cotizado = ?, resultado = ?
            WHERE id = ?
        `;
        const values = [clave, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado, id];

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el registro', error });
    }
};

// Eliminar un registro por ID
exports.eliminarRegistro = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM registros WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el registro', error });
    }
};
