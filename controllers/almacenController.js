const db = require('../model/db'); // Configuración de la base de datos

// Obtener el siguiente ID para un registro de almacén
exports.obtenerSiguienteIdAlmacen = async (req, res) => {
    try {
        // Consulta el último ID registrado
        const query = `SELECT MAX(idAlmacen) AS ultimo_id FROM almacen`;
        const [rows] = await db.execute(query);

        const ultimoId = rows[0]?.ultimo_id || 0; // Si no hay registros, empieza en 0
        const siguienteId = ultimoId + 1;

        // Responde con el siguiente ID
        res.status(200).json({ siguiente_id: siguienteId });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el siguiente ID de almacén',
            error,
        });
    }
};

// Crear un nuevo registro en almacén
exports.crearRegistroAlmacen = async (req, res) => {
    const {
        idUsuario,
        empresa,
        tipo_movimiento,
        fecha,
        pedido,
        producto,
        marca,
        proveedor,
        no_parte,
        no_serie,
        modelo,
        equipo,
        factura,
        moneda,
        inicial,
        precio_inicial,
        ctd_entradas,
        pu_entrada,
        concepto,
        anaquel,
        seccion,
        caja,
        observaciones
    } = req.body;

    try {
        // Obtén el siguiente ID si no está en la solicitud
        const queryId = `SELECT MAX(idAlmacen) AS ultimo_id FROM almacen`;
        const [rows] = await db.execute(queryId);
        const ultimoId = rows[0]?.ultimo_id || 0;
        const siguienteId = ultimoId + 1;

        // Inserta el nuevo registro
        const query = `
            INSERT INTO almacen (
            idAlmacen, idUsuario, empresa, tipo_movimiento, fecha, pedido, producto, marca, proveedor, no_parte, no_serie, modelo, equipo, factura, moneda, 
            inicial, precio_inicial, ctd_entradas, pu_entrada, concepto, anaquel, seccion, caja, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            siguienteId, idUsuario, empresa, tipo_movimiento, fecha, pedido, producto, marca, proveedor, no_parte, no_serie, modelo, equipo, factura, moneda, 
            inicial, precio_inicial, ctd_entradas, pu_entrada, concepto, anaquel, seccion, caja, observaciones
        ];

        const [result] = await db.execute(query, values);

        res.status(201).json({
            mensaje: 'Registro en almacén creado con éxito',
            registroId: result.insertId,
            siguiente_id: siguienteId // Devolver el siguiente ID
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el registro en almacén', error });
    }
};

// Obtener todos los registros de almacen
exports.obtenerRegistrosAlmacen = async (req, res) => {
    try {
        const query = 'SELECT * FROM almacen';
        const [registros] = await db.execute(query);

        res.json({ mensaje: 'Registros de almacén obtenidos', registros });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros de almacén', error });
    }
};

// Buscar un registro de almacén por ID
exports.obtenerRegistroPorId = async (req, res) => {
    const { idMov } = req.params;

    try {
        const query = 'SELECT * FROM almacen WHERE idAlmacen = ?';
        const [rows] = await db.execute(query, [idMov]);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro obtenido', registro: rows[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el registro por ID', error });
    }
};

// Registrar datos de salida para un registro de almacén
exports.registrarSalida = async (req, res) => {
    const { idMov } = req.params; // ID Mov asociado
    const {
        folio_vale_salida,
        ctd_salidas,
        precio_salidas,
        solicito,
        cliente,
        servicio,
        aplicacion,
        uso_en,
        recibio,
        condiciones_entrega
    } = req.body;

    try {
        // Verificar que el registro exista
        const queryVerificar = 'SELECT * FROM almacen WHERE idAlmacen = ?';
        const [registro] = await db.execute(queryVerificar, [idMov]);

        if (registro.length === 0) {
            return res.status(404).json({ mensaje: 'El registro con el ID proporcionado no existe' });
        }

        // Insertar los datos de salida
        const querySalida = `
            INSERT INTO salidas (
                idAlmacen, folio_vale_salida, ctd_salidas, precio_salidas, solicito, cliente, servicio, aplicacion, uso_en, recibio, condiciones_entrega
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            idMov, folio_vale_salida, ctd_salidas, precio_salidas, solicito, cliente, servicio, aplicacion, uso_en, recibio, condiciones_entrega
        ];

        await db.execute(querySalida, values);

        res.status(201).json({ mensaje: 'Datos de salida registrados con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar los datos de salida', error });
    }
};


/*
// Actualizar un registro de almacen por ID
exports.actualizarRegistroAlmacen = async (req, res) => {
    const { id } = req.params;
    const {
        idUsuario,
        tipo_movimiento,
        folio_vale_salida,
        fecha,
        empresa,
        pedido,
        solicito,
        producto,
        marca,
        no_serie,
        modelo,
        proveedor,
        cliente,
        inicial,
        precio_inicial,
        ctd_entradas,
        pu_entrada,
        ctd_salidas,
        precio_salidas,
        anaquel,
        seccion,
        caja,
        aplicacion,
        observaciones,
        concepto,
        recibio,
        servicio,
        factura,
        moneda,
        uso_en,
        condiciones_entrega,
        equipo,
        campo1,
        campo2,
        campo3
    } = req.body;

    try {
        const query = `
            UPDATE almacen
            SET
                idUsuario = ?, tipo_movimiento = ?, folio_vale_salida = ?, fecha = ?, empresa = ?, pedido = ?, 
                solicito = ?, producto = ?, marca = ?, no_serie = ?, modelo = ?, proveedor = ?, cliente = ?, 
                inicial = ?, precio_inicial = ?, ctd_entradas = ?, pu_entrada = ?, ctd_salidas = ?, 
                precio_salidas = ?, anaquel = ?, seccion = ?, caja = ?, aplicacion = ?, observaciones = ?, 
                concepto = ?, recibio = ?, servicio = ?, factura = ?, moneda = ?, uso_en = ?, 
                condiciones_entrega = ?, equipo = ?, campo1 = ?, campo2 = ?, campo3 = ?
            WHERE idAlmacen = ?
        `;
        const values = [
            idUsuario, tipo_movimiento, folio_vale_salida, fecha, empresa, pedido, solicito, producto, marca,
            no_serie, modelo, proveedor, cliente, inicial, precio_inicial, ctd_entradas, pu_entrada,
            ctd_salidas, precio_salidas, anaquel, seccion, caja, aplicacion, observaciones, concepto,
            recibio, servicio, factura, moneda, uso_en, condiciones_entrega, equipo, campo1, campo2, campo3,
            id
        ];

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro de almacén no encontrado' });
        }

        res.json({ mensaje: 'Registro de almacén actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el registro de almacén', error });
    }
};

// Eliminar un registro de almacen por ID
exports.eliminarRegistroAlmacen = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM almacen WHERE idAlmacen = ?';
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro de almacén no encontrado' });
        }

        res.json({ mensaje: 'Registro de almacén eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el registro de almacén', error });
    }
};*/