const db = require('../model/db'); // Configuración de la base de datos
const { format } = require('date-fns');

// Función para obtener el último OT del año actual y generar el siguiente
async function generarOT() {
    const anioActual = new Date().getFullYear();

    const [result] = await db.query(
        'SELECT MAX(CAST(SUBSTRING(OT, 4, 3) AS UNSIGNED)) AS ultimoNumero FROM registros WHERE YEAR(fecha_envio) = ?',
        [anioActual]
    );

    let siguienteNumero = 1;

    if (result[0].ultimoNumero) {
        siguienteNumero = result[0].ultimoNumero + 1;
    }

    const otGenerada = `CT-${String(siguienteNumero).padStart(3, "0")}/${anioActual}`;
    return otGenerada;
}
const { enviarCorreoCreacion } = require('../services/enviarCorreoCreacion');
exports.crearRegistro = async (req, res) => {
    try {
        const {
            clave,
            empresa,
            fechaEnvio,
            descripcion = "",
            contacto = "",
            lugar = "",
            id_cliente,
            creadoPor = "DESCONOCIDO"
        } = req.body;

        // 🚫 Validación de campos obligatorios
        if (!empresa || !fechaEnvio || !id_cliente) {
            return res.status(400).json({ mensaje: "Empresa, fecha de envío y cliente son obligatorios" });
        }

        // 🛠️ Generación de valores
        const claveGenerada = clave || `CL-${id_cliente}-${Date.now()}`;
        const otGenerada = await generarOT();
        const resultado = descripcion.trim() === "" ? "Sin descripción" : descripcion;

        // 📥 Insertar registro en la base de datos
        const [result] = await db.query(
            `INSERT INTO registros 
                (clave, OT, empresa, fecha_envio, descripcion, resultado, contacto, lugar, id_cliente, creadoPor) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [claveGenerada, otGenerada, empresa, fechaEnvio, descripcion, resultado, contacto, lugar, id_cliente, creadoPor]
        );

        // ✅ CONSULTAR ADMINISTRADORES
        const [admins] = await db.query(`
            SELECT username, correo, empresa, nombre 
            FROM users 
            WHERE role = 'admin' AND verificado = 1
        `);

        // 📨 DATOS DEL REGISTRO PARA EL CORREO
        const datosRegistro = {
            registroId: result.insertId,
            clave: claveGenerada,
            empresa,
            descripcion,
            contacto,
            username: creadoPor
        };

        // 🟢 ENVIAR CORREO A CADA ADMINISTRADOR (Correo de creación)
        for (const admin of admins) {
            try {
                await enviarCorreoCreacion(admin.correo, { ...datosRegistro, nombre: admin.nombre });
            } catch (error) {
                console.error(`❌ No se pudo enviar correo de creación a ${admin.correo}:`, error.message);
                // Continuamos con los demás
            }
        }

        // ✅ RESPUESTA EXITOSA
        res.status(201).json({
            mensaje: "Registro creado exitosamente y notificación enviada a los administradores",
            id: result.insertId,
            clave: claveGenerada,
            OT: otGenerada
        });

    } catch (error) {
        console.error("❌ Error al crear el registro:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};
// Función para crear un nuevo cliente
exports.crearCliente = async (req, res) => {
    try {
        const {
            nombre_cliente,
            empresa,
            razon_social,
            rfc,
            correo_electronico,
            telefono_contacto,
            calle,
            ciudad,
            estado,
            pais,
            codigo_postal
        } = req.body;

        console.log("Datos recibidos en el servidor:", req.body);  // Verificar los datos recibidos

        if (!nombre_cliente || !rfc) {
            return res.status(400).json({
                mensaje: "El nombre del cliente y el RFC son obligatorios."
            });
        }

        const [existingClient] = await db.query(
            `SELECT * FROM cliente WHERE nombre_cliente = ?`,
            [nombre_cliente]
        );

        if (existingClient.length > 0) {
            return res.status(400).json({
                mensaje: "Ya existe un cliente con este nombre. Por favor, elige otro."
            });
        }

        const [result] = await db.query(
            `INSERT INTO cliente 
            (nombre_cliente, empresa, razon_social, rfc, correo_electronico, telefono_contacto, calle, ciudad, estado, pais, codigo_postal) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre_cliente,
                empresa,  // Asegúrate de que este campo se esté enviando correctamente
                razon_social,
                rfc,
                correo_electronico,
                telefono_contacto,
                calle,
                ciudad,
                estado,
                pais,
                codigo_postal
            ]
        );

        res.status(201).json({
            mensaje: "Cliente creado exitosamente.",
            id_cliente: result.insertId
        });

    } catch (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ mensaje: "Error en el servidor." });
    }
};


exports.listarClientes = async (req, res) => {
    try {
        const [clientes] = await db.query("SELECT * FROM cliente");
        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ mensaje: "Error en el servidor." });
    }
};

exports.actualizarCliente = async (req, res) => {
    try {
        const { id_cliente } = req.params;
        const { nombre_cliente, razon_social, rfc, correo_electronico, telefono_contacto, calle, ciudad, estado, pais, codigo_postal, empresa } = req.body;

        // Validar que el ID y al menos un campo a actualizar estén presentes
        if (!id_cliente) {
            return res.status(400).json({ mensaje: "El ID del cliente es obligatorio." });
        }

        const [result] = await db.query(
            `UPDATE cliente SET 
                nombre_cliente = ?, 
                razon_social = ?, 
                rfc = ?, 
                correo_electronico = ?, 
                telefono_contacto = ?, 
                calle = ?, 
                ciudad = ?, 
                estado = ?, 
                pais = ?, 
                codigo_postal = ?, 
                empresa = ? 
            WHERE id_cliente = ?`,
            [nombre_cliente, razon_social, rfc, correo_electronico, telefono_contacto, calle, ciudad, estado, pais, codigo_postal, empresa, id_cliente]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado." });
        }

        res.json({ mensaje: "Cliente actualizado correctamente." });
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ mensaje: "Error en el servidor." });
    }
};


exports.eliminarCliente = async (req, res) => {
    try {
        const { id_cliente } = req.params;

        const [result] = await db.query("DELETE FROM cliente WHERE id_cliente = ?", [id_cliente]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado." });
        }

        res.json({ mensaje: "Cliente eliminado exitosamente." });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ mensaje: "Error en el servidor al eliminar el cliente." });
    }
};

// Función para obtener un cliente por su ID
exports.obtenerCliente = async (req, res) => {
    const { id_cliente } = req.params;
    try {
        const [cliente] = await db.query(`
            SELECT id_cliente, nombre_cliente, empresa 
            FROM cliente 
            WHERE id_cliente = ?
        `, [id_cliente]);

        if (cliente.length === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }

        res.json(cliente[0]);
    } catch (error) {
        console.error("Error al obtener cliente:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Función para obtener todos los datos de un cliente por su ID
exports.obtenerTodosLosDatosCliente = async (req, res) => {
    const { id_cliente } = req.params;
    try {
        const [resultado] = await db.query(`
            SELECT 
                id_cliente,
                nombre_cliente,
                empresa,
                razon_social,
                rfc,
                correo_electronico,
                telefono_contacto,
                calle,
                ciudad,
                estado,
                pais,
                codigo_postal
            FROM cliente 
            WHERE id_cliente = ?
        `, [id_cliente]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }

        res.json(resultado[0]);
    } catch (error) {
        console.error("Error al obtener todos los datos del cliente:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};


exports.obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await db.query('SELECT id_cliente, nombre_cliente FROM cliente');
        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
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

const { enviarCorreoAsignacion } = require("../services/correoAsignacion"); 

exports.asignarPersonal = async (req, res) => {
    const { id } = req.params;
    const { empleadoId } = req.body;

    if (!empleadoId || isNaN(empleadoId)) {
        return res.status(400).json({ mensaje: "El ID del empleado es obligatorio y debe ser un número válido" });
    }

    try {
        // Consultar usuario y datos del registro asignado
        const query = `
            SELECT r.id AS registroId, r.clave, r.empresa, r.descripcion, r.contacto, 
                   u.nombre, u.username, u.correo
            FROM registros r 
            JOIN users u ON u.id = ?
            WHERE r.id = ?`;

        const [rows] = await db.execute(query, [empleadoId, id]);

        console.log("🔍 Datos obtenidos de la consulta:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Registro o empleado no encontrado" });
        }

        const usuario = rows[0];

        if (!usuario.correo) {
            console.error("❌ Error: El usuario no tiene un correo registrado.");
            return res.status(400).json({ mensaje: "El usuario no tiene un correo registrado." });
        }

        console.log(`📧 Intentando enviar correo a: ${usuario.correo}, usuario: ${usuario.username}, registro ID: ${usuario.registroId}`);

        // Actualizar el registro con el empleado asignado
        const updateQuery = "UPDATE registros SET empleado_asignado = ? WHERE id = ?";
        const [result] = await db.execute(updateQuery, [usuario.username, id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ mensaje: "El personal ya estaba asignado o no se pudo asignar" });
        }

        // Enviar correo de notificación con los datos completos
        await enviarCorreoAsignacion(usuario.correo, usuario);

        res.json({ 
            mensaje: "Personal asignado correctamente y correo enviado", 
            empleado_asignado: usuario.username, 
            registroId: id 
        });

    } catch (error) {
        console.error("❌ Error al asignar personal:", error);
        res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
    }
};

// Cargar datos de la Orden de Trabajo (OT) junto con los datos del cliente
exports.cargarDatosOT = async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ mensaje: "El parámetro 'id' es requerido" });
    }

    try {
        // Realizar la consulta con JOIN entre registros y clientes
        const [result] = await db.execute(
            `SELECT 
                r.id, r.clave, r.OT, r.empresa, r.fecha_envio, r.descripcion, r.contacto, r.importe_cotizado, 
                r.resultado, r.creadoPor, r.empleado_asignado, r.fecha_inicio, r.fecha_termino, r.contrato_pedido, 
                r.lugar, r.observaciones, r.facturas, r.id_cliente, r.tipo_servicio,
                c.nombre_cliente, c.razon_social, c.rfc, c.correo_electronico, c.telefono_contacto,
                c.calle, c.ciudad, c.estado, c.pais, c.codigo_postal
            FROM registros r
            LEFT JOIN cliente c ON r.id_cliente = c.id_cliente
            WHERE r.id = ?`,
            [id]
        );

        console.log("🔍 Consulta SQL ejecutada:", result); // Imprimir los datos obtenidos

        if (result.length === 0) {
            return res.status(404).json({ mensaje: "Orden de trabajo no encontrada" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("❌ Error al obtener la OT:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

exports.guardarOT = async (req, res) => {
    try {
        const { id, clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado, resultado, creadoPor, empleado_asignado, fecha_inicio, fecha_termino, contrato_pedido, lugar, observaciones, facturas, cliente, tipo_servicio } = req.body;

        // Validar datos obligatorios
        if (!clave?.trim() || !empresa?.trim() || !contacto?.trim() || !resultado?.trim() || !creadoPor?.trim() || !cliente?.trim() || !tipo_servicio?.length) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios (clave, empresa, contacto, resultado, creadoPor, cliente, tipo_servicio)" });
        }

        console.log("📩 Datos recibidos en guardarOT:", req.body);

        const query = `
            INSERT INTO registros (id, clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado, resultado, creadoPor, empleado_asignado, fecha_inicio, fecha_termino, contrato_pedido, lugar, observaciones, facturas, cliente, tipo_servicio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                clave = VALUES(clave),
                OT = VALUES(OT),
                empresa = VALUES(empresa),
                fecha_envio = VALUES(fecha_envio),
                descripcion = VALUES(descripcion),
                contacto = VALUES(contacto),
                importe_cotizado = VALUES(importe_cotizado),
                resultado = VALUES(resultado),
                creadoPor = VALUES(creadoPor),
                empleado_asignado = VALUES(empleado_asignado),
                fecha_inicio = VALUES(fecha_inicio),
                fecha_termino = VALUES(fecha_termino),
                contrato_pedido = VALUES(contrato_pedido),
                lugar = VALUES(lugar),
                observaciones = VALUES(observaciones),
                facturas = VALUES(facturas),
                cliente = VALUES(cliente),
                tipo_servicio = VALUES(tipo_servicio);
        `;

        await db.execute(query, [
            id ?? null, clave, OT ?? null, empresa, fecha_envio ?? null, descripcion ?? null, contacto,
            importe_cotizado ?? null, resultado, creadoPor, empleado_asignado ?? null, fecha_inicio ?? null,
            fecha_termino ?? null, contrato_pedido ?? null, lugar ?? null, observaciones ?? null, facturas ?? null,
            cliente, JSON.stringify(tipo_servicio) // Guardar como JSON si es un array
        ]);

        res.json({ mensaje: "✅ Orden de Trabajo guardada correctamente" });

    } catch (error) {
        console.error("❌ Error al guardar la OT:", error);
        res.status(500).json({ mensaje: "⚠️ Error en el servidor", error: error.message, code: error.code });
    }
};
exports.actualizarOT = async (req, res) => {
    const { id } = req.body; // Obtener el ID de la OT desde el cuerpo de la solicitud

    if (!id) {
        return res.status(400).json({ mensaje: "El campo 'id' es obligatorio" });
    }

    try {
        // Extraer los datos del cuerpo de la solicitud
        let {
            clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado,
            resultado, creadoPor, empleado_asignado, fecha_inicio, fecha_termino,
            contrato_pedido, lugar, observaciones, facturas, tipo_servicio
        } = req.body;

        console.log("🟢 Datos recibidos en el backend:", req.body);

        // Asegurar que tipo_servicio sea un string separado por comas
        if (Array.isArray(tipo_servicio)) {
            tipo_servicio = tipo_servicio.join(", ");
        }

        // Definir la consulta SQL para actualizar la OT
        const query = `
            UPDATE registros 
            SET clave = ?, OT = ?, empresa = ?, fecha_envio = ?, descripcion = ?, contacto = ?, 
                importe_cotizado = ?, resultado = ?, creadoPor = ?, empleado_asignado = ?, 
                fecha_inicio = ?, fecha_termino = ?, contrato_pedido = ?, lugar = ?, 
                observaciones = ?, facturas = ?, tipo_servicio = ?
            WHERE id = ?
        `;

        // Ejecutar la consulta SQL
        const [result] = await db.execute(query, [
            clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado,
            resultado, creadoPor, empleado_asignado, fecha_inicio, fecha_termino,
            contrato_pedido, lugar, observaciones, facturas, tipo_servicio, id
        ]);

        console.log("🔵 Resultado de la actualización:", result);

        // Verificar si se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Orden de trabajo no encontrada o sin cambios" });
        }

        res.json({ mensaje: "✅ Orden de trabajo actualizada correctamente" });

    } catch (error) {
        console.error("❌ Error al actualizar la OT:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};