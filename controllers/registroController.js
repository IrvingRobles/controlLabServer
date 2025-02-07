const db = require('../model/db'); // Configuración de la base de datos
const { format } = require('date-fns');

// Función para crear un nuevo registro
exports.crearRegistro = async (req, res) => {
    const { clave, OT, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado, creadoPor } = req.body;

    try {
        // Insertar en la base de datos
        const [result] = await db.query(
            `INSERT INTO registros (clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado, resultado, creadoPor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clave, OT, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado, creadoPor]
        );

        res.status(201).json({ mensaje: "Registro creado exitosamente", id: result.insertId });
    } catch (error) {
        console.error("Error al crear el registro:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
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
    let { clave, OT, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado } = req.body;

    try {
        // Convertir fecha al formato YYYY-MM-DD HH:MM:SS
        fechaEnvio = format(new Date(fechaEnvio), 'yyyy-MM-dd HH:mm:ss');

        const query = `
            UPDATE registros
            SET clave = ?, OT = ?, empresa = ?, fecha_envio = ?, descripcion = ?, 
                contacto = ?, importe_cotizado = ?, resultado = ?
            WHERE id = ?`;

        const values = [clave, OT, empresa, fechaEnvio, descripcion, contacto, importeCotizado, resultado, id];

        console.log("Fecha formateada:", fechaEnvio); // Debug

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Registro no encontrado" });
        }

        res.json({ mensaje: "Registro actualizado con éxito" });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ mensaje: "Error al actualizar el registro", error });
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

exports.obtenerRegistroAsignado = async (req, res) => {
    try {
        const usuarioActual = req.headers["usuario"]; // Asegurar que se recibe correctamente
        
        if (!usuarioActual) {
            return res.status(401).json({ mensaje: "Usuario no autenticado" });
        }

        // Filtrar solo registros asignados al usuario que inició sesión
        const query = 'SELECT * FROM registros WHERE empleado_asignado = ?';
        const [registros] = await db.execute(query, [usuarioActual]);

        res.json({ mensaje: 'Registros asignados obtenidos', registros });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros asignados', error });
    }
};

exports.obtenerEmpleados = async (req, res) => {
    try {
        const query = `SELECT id, nombre FROM users`; 
        const [empleados] = await db.execute(query);

        if (!empleados.length) {
            return res.status(404).json({ mensaje: 'No se encontraron empleados' });
        }

        res.json(empleados);
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
exports.asignarPersonal = async (req, res) => {
    const { id } = req.params;
    const { empleadoId } = req.body;

    console.log("Datos recibidos:", req.body); // <-- Agrega esto para depuración

    if (!empleadoId) {
        return res.status(400).json({ mensaje: "El ID del empleado es obligatorio" });
    }

    try {
        // Verificar si el registro existe
        const [registro] = await db.execute("SELECT * FROM registros WHERE id = ?", [id]);
        if (registro.length === 0) {
            return res.status(404).json({ mensaje: "Registro no encontrado" });
        }

        // Verificar si el empleado existe y obtener el username
        const [empleado] = await db.execute("SELECT username FROM users WHERE id = ?", [empleadoId]);
        if (empleado.length === 0) {
            return res.status(404).json({ mensaje: "Empleado no encontrado" });
        }

        const username = empleado[0].username;

        // Asignar empleado
        const query = "UPDATE registros SET empleado_asignado = ? WHERE id = ?";
        const [result] = await db.execute(query, [username, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ mensaje: "No se pudo asignar personal" });
        }

        res.json({ mensaje: "Personal asignado correctamente", empleado_asignado: username });
    } catch (error) {
        console.error("Error al asignar personal:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }   

};

exports.cargarDatosOT = async (req, res) => {
    const { id } = req.query; // Cambié 'clave' por 'id'
    try {
        const [result] = await db.execute("SELECT * FROM registros WHERE id = ?", [id]); // Usamos 'id' en lugar de 'clave'
        if (result.length === 0) {
            return res.status(404).json({ mensaje: "Orden de trabajo no encontrada" });
        }
        res.json(result[0]);
    } catch (error) {
        console.error("Error al obtener la OT:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

exports.guardarOT = async (req, res) => {
    const { id, fecha_inicio, fecha_termino, empresa, contrato_pedido, lugar, descripcion, empleado_asignado, observaciones, facturas } = req.body; // Cambié 'clave' por 'id'
    try {
        const query = `
            INSERT INTO registros (id, fecha_inicio, fecha_termino, empresa, contrato_pedido, lugar, descripcion, empleado_asignado, observaciones, facturas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                fecha_inicio = VALUES(fecha_inicio), 
                fecha_termino = VALUES(fecha_termino), 
                empresa = VALUES(empresa), 
                contrato_pedido = VALUES(contrato_pedido), 
                lugar = VALUES(lugar), 
                descripcion = VALUES(descripcion), 
                empleado_asignado = VALUES(empleado_asignado), 
                observaciones = VALUES(observaciones), 
                facturas = VALUES(facturas);`;

        await db.execute(query, [id, fecha_inicio, fecha_termino, empresa, contrato_pedido, lugar, descripcion, empleado_asignado, observaciones, facturas]);

        res.json({ mensaje: "Orden de Trabajo guardada correctamente" });
    } catch (error) {
        console.error("Error al guardar la OT:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};
