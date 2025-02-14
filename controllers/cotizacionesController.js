const db = require('../model/db'); // Configuración de la base de datos

// Obtener los datos de la Orden de Trabajo y sus cotizaciones
exports.obtenerOTC = async (req, res) => {
    const { id } = req.params; // Obtener el ID de los parámetros de la ruta
    if (!id) {
        return res.status(400).json({ mensaje: "El parámetro 'id' es requerido" });
    }

    try {
        // Obtener la orden de trabajo por ID
        const [ordenTrabajo] = await db.query(`
            SELECT id, clave, OT, empresa, fecha_envio, descripcion, contacto, importe_cotizado,
                   resultado, creadoPor, empleado_asignado, fecha_inicio, fecha_termino, contrato_pedido,
                   lugar, observaciones, facturas, cliente, tipo_servicio
            FROM registros WHERE id = ?`, [id]);
        
        if (ordenTrabajo.length === 0) {
            return res.status(404).json({ mensaje: "Orden de trabajo no encontrada" });
        }

        // Obtener las cotizaciones relacionadas con el ID de la orden de trabajo
        const [cotizaciones] = await db.query(`
            SELECT id, referencia, num_cotizacion, fecha_expiracion, metodo_embarque, realizado_por
            FROM cotizaciones WHERE id_ot = ?`, [id]);

        // Enviar la respuesta consolidada
        res.json({
            ordenTrabajo: ordenTrabajo[0], // Solo enviamos el primer registro de orden de trabajo
            cotizaciones: cotizaciones // Todas las cotizaciones relacionadas
        });
    } catch (error) {
        console.error("Error al obtener la OT y cotizaciones:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Guardar o actualizar datos en las tablas `registros` y `cotizaciones`
exports.guardarOTC = async (req, res) => {
    const {
        id, clave, OT, empresa, fecha_envio, descripcion, contacto,
        importe_cotizado, resultado, creadoPor, empleado_asignado,
        fecha_inicio, fecha_termino, contrato_pedido, lugar,
        observaciones, facturas, cliente, tipo_servicio,
        cotizaciones // Este campo será un array con los datos de las cotizaciones
    } = req.body;

    if (!clave || !OT || !empresa) {
        return res.status(400).json({ mensaje: "Los campos clave, OT y empresa son requeridos" });
    }

    const connection = await db.getConnection(); // Crear una transacción
    try {
        await connection.beginTransaction();

        let ordenTrabajoId = id;

        if (id) {
            // Actualizar una orden de trabajo existente
            const [result] = await connection.query(`
                UPDATE registros SET
                    clave = ?, OT = ?, empresa = ?, fecha_envio = ?, descripcion = ?, contacto = ?,
                    importe_cotizado = ?, resultado = ?, creadoPor = ?, empleado_asignado = ?,
                    fecha_inicio = ?, fecha_termino = ?, contrato_pedido = ?, lugar = ?,
                    observaciones = ?, facturas = ?, cliente = ?, tipo_servicio = ?
                WHERE id = ?`, [
                clave, OT, empresa, fecha_envio, descripcion, contacto,
                importe_cotizado, resultado, creadoPor, empleado_asignado,
                fecha_inicio, fecha_termino, contrato_pedido, lugar,
                observaciones, facturas, cliente, tipo_servicio, id
            ]);

            if (result.affectedRows === 0) {
                throw new Error("Orden de trabajo no encontrada");
            }
        } else {
            // Crear una nueva orden de trabajo
            const [result] = await connection.query(`
                INSERT INTO registros (
                    clave, OT, empresa, fecha_envio, descripcion, contacto, 
                    importe_cotizado, resultado, creadoPor, empleado_asignado, 
                    fecha_inicio, fecha_termino, contrato_pedido, lugar, 
                    observaciones, facturas, cliente, tipo_servicio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                clave, OT, empresa, fecha_envio, descripcion, contacto,
                importe_cotizado, resultado, creadoPor, empleado_asignado,
                fecha_inicio, fecha_termino, contrato_pedido, lugar,
                observaciones, facturas, cliente, tipo_servicio
            ]);

            ordenTrabajoId = result.insertId;
        }

        // Guardar o actualizar cotizaciones relacionadas
        if (cotizaciones && cotizaciones.length > 0) {
            for (const cotizacion of cotizaciones) {
                const {
                    id: cotizacionId, referencia, num_cotizacion,
                    fecha_expiracion, metodo_embarque, realizado_por
                } = cotizacion;

                if (cotizacionId) {
                    // Actualizar cotización existente
                    await connection.query(`
                        UPDATE cotizaciones SET
                            referencia = ?, num_cotizacion = ?, fecha_expiracion = ?,
                            metodo_embarque = ?, realizado_por = ?
                        WHERE id = ? AND id_ot = ?`, [
                        referencia, num_cotizacion, fecha_expiracion,
                        metodo_embarque, realizado_por, cotizacionId, ordenTrabajoId
                    ]);
                } else {
                    // Crear una nueva cotización
                    await connection.query(`
                        INSERT INTO cotizaciones (
                            id_ot, referencia, num_cotizacion, fecha_expiracion,
                            metodo_embarque, realizado_por
                        ) VALUES (?, ?, ?, ?, ?, ?)`, [
                        ordenTrabajoId, referencia, num_cotizacion,
                        fecha_expiracion, metodo_embarque, realizado_por
                    ]);
                }
            }
        }

        await connection.commit(); // Confirmar la transacción
        res.status(201).json({ mensaje: "Orden de trabajo y cotizaciones guardadas exitosamente" });
    } catch (error) {
        await connection.rollback(); // Revertir cambios en caso de error
        console.error("Error al guardar la OT y cotizaciones:", error);
        res.status(500).json({ mensaje: "Error en el servidor al guardar los datos" });
    } finally {
        connection.release(); // Liberar la conexión
    }
};
