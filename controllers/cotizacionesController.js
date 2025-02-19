const db = require('../model/db'); // Configuración de la base de datos

// Obtener los datos de la Orden de Trabajo y sus cotizaciones
exports.obtenerOTC = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la OT
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

        // Obtener las cotizaciones relacionadas con la OT
        const [cotizaciones] = await db.query(`
            SELECT id, referencia, num_cotizacion, fecha_expiracion, metodo_embarque, realizado_por
            FROM cotizaciones WHERE id_ot = ?`, [id]);

        let materiales = [];
        if (cotizaciones.length > 0) {
            const cotizacionIds = cotizaciones.map(cot => cot.id);
            [materiales] = await db.query(`
                SELECT id, id_cotizacion, pda, cantidad, unidad, descripcion, precio_unitario, importe_total
                FROM materiales WHERE id_cotizacion IN (?)`, [cotizacionIds]);
        }

        res.json({
            ordenTrabajo: ordenTrabajo[0],
            cotizaciones: cotizaciones,
            materiales: materiales
        });

    } catch (error) {
        console.error("Error al obtener la OT, cotizaciones y materiales:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Eliminar un material por ID
// Eliminar un material por ID
exports.eliminarMaterial = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ mensaje: "El parámetro 'id' es requerido" });
    }

    try {
        const result = await db.query('DELETE FROM materiales WHERE id = ?', [id]);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ mensaje: "Material no encontrado" });
        }

        res.json({ mensaje: "Material eliminado correctamente" });

    } catch (error) {
        console.error("Error al eliminar material:", error);
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
};

// Guardar o actualizar cotización
exports.guardarCotizacion = async (req, res) => {
    const {
        id,
        id_ot,
        referencia = '',
        num_cotizacion = '',
        fecha_expiracion = null,
        metodo_embarque = '',
        realizado_por = '',
        materiales = []
    } = req.body;

    if (!id_ot || !num_cotizacion || !fecha_expiracion) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios en la cotización" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let cotizacionId = id;

        if (id) {
            const [result] = await connection.query(`
                UPDATE cotizaciones SET
                    referencia = ?, num_cotizacion = ?, fecha_expiracion = ?, 
                    metodo_embarque = ?, realizado_por = ?
                WHERE id = ? AND id_ot = ?`, [
                referencia, num_cotizacion, fecha_expiracion,
                metodo_embarque, realizado_por, id, id_ot
            ]);

            if (result.affectedRows === 0) {
                throw new Error("Cotización no encontrada o no pertenece a la orden de trabajo");
            }
        } else {
            const [result] = await connection.query(`
                INSERT INTO cotizaciones (
                    id_ot, referencia, num_cotizacion, fecha_expiracion, 
                    metodo_embarque, realizado_por
                ) VALUES (?, ?, ?, ?, ?, ?)`, [
                id_ot, referencia, num_cotizacion, fecha_expiracion,
                metodo_embarque, realizado_por
            ]);

            cotizacionId = result.insertId;
        }

        if (Array.isArray(materiales) && materiales.length > 0) {
            const valoresMateriales = materiales
                .filter(m => m.pda && m.cantidad !== '' && !isNaN(m.cantidad))
                .map(m => [
                    cotizacionId, m.pda,
                    Number(m.cantidad) || 0,
                    m.unidad || 'N/A',
                    m.descripcion || 'N/A',
                    Number(m.precio_unitario) || 0,
                    Number(m.importe_total) || 0
                ]);

            if (valoresMateriales.length > 0) {
                await connection.query(`
                    INSERT INTO materiales (
                        id_cotizacion, pda, cantidad, unidad, descripcion, 
                        precio_unitario, importe_total
                    ) VALUES ?
                    ON DUPLICATE KEY UPDATE
                        cantidad = VALUES(cantidad),
                        unidad = VALUES(unidad),
                        descripcion = VALUES(descripcion),
                        precio_unitario = VALUES(precio_unitario),
                        importe_total = VALUES(importe_total)
                `, [valoresMateriales]);
            }
        }

        // Actualizar importe_cotizado de la orden de trabajo
        const [resultOT] = await connection.query(`
            UPDATE registros
            SET importe_cotizado = (
                SELECT SUM(importe_total) FROM materiales WHERE id_cotizacion IN (
                    SELECT id FROM cotizaciones WHERE id_ot = ?
                )
            )
            WHERE id = ?`, [id_ot, id_ot]);

        if (resultOT.affectedRows === 0) {
            throw new Error("No se pudo actualizar el importe cotizado en la orden de trabajo");
        }

        await connection.commit();
        res.status(201).json({ mensaje: "Cotización, materiales y importe cotizado actualizados exitosamente" });

    } catch (error) {
        await connection.rollback();
        console.error("Error al guardar la cotización:", error.message);
        res.status(500).json({ mensaje: `Error en el servidor: ${error.message}` });
    } finally {
        connection.release();
    }
};
