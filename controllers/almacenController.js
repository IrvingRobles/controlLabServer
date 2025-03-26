const db = require('../model/db');

// Obtener el siguiente ID para un registro de almacén
exports.obtenerSiguienteIdAlmacen = async (req, res) => {
    try {
        // Consulta el último ID registrado
        const query = `SELECT MAX(idAlmacen) AS ultimo_id FROM entrada`;
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

// Ruta para obtener las monedas
exports.obtenerMonedas = async (req, res) => {
    try {
        // Consulta para obtener los nombres de las monedas y guardar el idMoneda
        const query = 'SELECT idMoneda, nombre, codigo FROM moneda'; // Ajusta los campos según tu base de datos
        const [rows] = await db.execute(query);

        res.status(200).json(rows); // Enviar la lista de monedas como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las monedas', error });
    }
};

exports.registrarMoneda = async (req, res) => {
    const { nombre, codigo } = req.body;
    if (!nombre || !codigo) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    try {
        // 1️⃣ Verificar si el código de la moneda ya existe
        const queryCheck = 'SELECT * FROM moneda WHERE codigo = ? OR nombre = ?';
        const [rows] = await db.query(queryCheck, [codigo, nombre]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El código de la moneda ya está registrado. Intenta con otro.' });
        }
        // 2️⃣ Insertar la nueva moneda si no existe
        const queryInsert = 'INSERT INTO moneda (nombre, codigo) VALUES (?, ?)';
        await db.query(queryInsert, [nombre, codigo]);
        res.status(201).json({ message: 'Moneda registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar moneda:', error);
        res.status(500).json({ message: 'Error al registrar la moneda.' });
    }
};

exports.eliminarMoneda = async (req, res) => {
    try {
        const { id } = req.params;
        const queryDelete = `DELETE FROM moneda WHERE idMoneda = ?`;
        await db.query(queryDelete, [id]);
        res.status(200).json({ message: "Moneda eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la moneda', error });
    }
};

exports.obtenerMonedaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT idMoneda, nombre, codigo FROM moneda WHERE idMoneda = ?';
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Moneda no encontrada' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la moneda', error });
    }
};

exports.registrarEmpresa = async (req, res) => {
    try {
        const { codigo, nombre, rfc, direccion } = req.body;
        if (!codigo || !nombre || !rfc || !direccion) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        // Verificar si la empresa ya existe
        const queryCheck = `SELECT * FROM empresa WHERE codigo = ? OR rfc = ?`;
        const [rows] = await db.query(queryCheck, [codigo, rfc]);
        if (rows.length > 0) {
            return res.status(400).json({ message: "Empresa o RFC ya está registrado. Intenta con otro." });
        }
        // Insertar la empresa
        const queryInsert = `INSERT INTO empresa (codigo, nombre, rfc, direccion) VALUES (?, ?, ?, ?)`;
        await db.query(queryInsert, [codigo, nombre, rfc, direccion]);
        res.status(201).json({ message: "¡Empresa registrada correctamente!" });
    } catch (error) {
        console.error('Error al registrar empresa:', error);
        res.status(500).json({ message: "Error en el servidor. Inténtelo de nuevo más tarde." });
    }
};

exports.obtenerEmpresaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT idEmpresa, codigo, nombre, rfc, direccion FROM empresa WHERE idEmpresa = ?';
        const [rows] = await db.execute(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la empresa', error });
    }
};

exports.eliminarEmpresa = async (req, res) => {
    try {
        const { id } = req.params;
        const queryDelete = `DELETE FROM empresa WHERE idEmpresa = ?`;
        await db.query(queryDelete, [id]);
        res.status(200).json({ message: "Empresa eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la empresa', error });
    }
};

exports.obtenerEmpresas = async (req, res) => {
    try {
        const query = 'SELECT idEmpresa, codigo, nombre FROM empresa';
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las empresas', error });
    }
};

// Crear un nuevo registro en almacén
exports.crearRegistroAlmacen = async (req, res) => {
    const {
        idUsuario,
        idEmpresa,
        idMovimiento,
        fecha,
        idProducto,  // ID del producto
        factura,
        idMoneda,
        ctd_entradas, // Cantidad de entradas
        pu_entrada, // Precio unitario de la entrada
        concepto,
        anaquel,
        seccion,
        caja,
        observaciones
    } = req.body;
    try {
        // 📌 1️⃣ Insertar el nuevo registro en 'almacen' (SIN especificar idAlmacen, ya que es AUTO_INCREMENT)
        const queryAlmacen = `
            INSERT INTO entrada (idUsuario, idEmpresa, idMovimiento, fecha, idProducto, factura,
        idMoneda, ctd_entradas, pu_entrada, concepto, anaquel, seccion, caja, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valuesAlmacen = [
            idUsuario, idEmpresa, idMovimiento, fecha, idProducto, factura, idMoneda, ctd_entradas,
            pu_entrada, concepto, anaquel, seccion, caja, observaciones
        ];
        const [result] = await db.query(queryAlmacen, valuesAlmacen);
        const nuevoIdAlmacen = result.insertId; // Obtener el ID insertado automáticamente

        // 📌 2️⃣ Actualizar los datos en la tabla 'producto'
        const queryUpdateProducto = `
            UPDATE producto 
            SET inicial = inicial + ?
            WHERE idProducto = ?
        `;
        await db.execute(queryUpdateProducto, [ctd_entradas, idProducto]);

        // 📌 3️⃣ Responder con éxito
        res.status(201).json({
            mensaje: 'Registro en almacén creado con éxito y producto actualizado',
            registroId: nuevoIdAlmacen
        });
    } catch (error) {
        console.error('Error al crear el registro:', error);
        res.status(500).json({ mensaje: 'Error al crear el registro en almacén', error });
    }
};

// Obtener un registro por ID con información del producto
exports.obtenerRegistroPorId1 = async (req, res) => {
    const { idAlmacen } = req.params;

    try {
        const query = `
            SELECT 
                e.idAlmacen, e.idEmpresa, e.idMovimiento, e.fecha, e.idProducto, e.factura, 
                e.idMoneda, e.ctd_entradas, e.pu_entrada, e.concepto, e.anaquel, e.seccion, 
                e.caja, e.observaciones, e.idUsuario,
                emp.codigo AS idEmpresa, 
                m.nombre AS idMovimiento, 
                p.nombre AS idProducto, p.inicial, p.precio_inicial, 
                mon.codigo AS idMoneda, 
                u.username AS idUsuario
            FROM entrada e
            JOIN empresa emp ON e.idEmpresa = emp.idEmpresa
            JOIN movimiento m ON e.idMovimiento = m.idMovimiento
            JOIN producto p ON e.idProducto = p.idProducto
            JOIN moneda mon ON e.idMoneda = mon.idMoneda
            JOIN users u ON e.idUsuario = u.id
            WHERE e.idAlmacen = ?`;

        const [rows] = await db.query(query, [idAlmacen]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        res.status(200).json(rows[0]); // Retornar el primer resultado encontrado
    } catch (error) {
        console.error('Error al obtener el registro:', error);
        res.status(500).json({ message: 'Error al obtener el registro.' });
    }
};

// Obtener un registro por ID con información del producto
exports.obtenerRegistroPorId2 = async (req, res) => {
    const { idAlmacen } = req.params;

    try {
        const query = `
            SELECT 
                e.idAlmacen, 
                e.idEmpresa, 
                e.idMovimiento, 
                e.fecha, 
                e.idProducto, 
                e.factura, 
                e.idMoneda, 
                e.ctd_entradas, 
                e.pu_entrada, 
                e.concepto, 
                e.anaquel, 
                e.seccion, 
                e.caja, 
                e.observaciones, 
                e.idUsuario,
                emp.codigo AS empresaCodigo, 
                m.nombre AS movimientoNombre, 
                p.nombre AS productoNombre, 
                p.inicial, 
                p.precio_inicial, 
                mon.codigo AS monedaCodigo, 
                u.username AS usuarioNombre
            FROM entrada e
            JOIN empresa emp ON e.idEmpresa = emp.idEmpresa
            JOIN movimiento m ON e.idMovimiento = m.idMovimiento
            JOIN producto p ON e.idProducto = p.idProducto
            JOIN moneda mon ON e.idMoneda = mon.idMoneda
            JOIN users u ON e.idUsuario = u.id
            WHERE e.idAlmacen = ?`;

        const [rows] = await db.query(query, [idAlmacen]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        // Formatear la respuesta para que coincida con lo que espera el frontend
        const registro = {
            idAlmacen: rows[0].idAlmacen,
            idEmpresa: rows[0].idEmpresa, // ID de la empresa
            empresaCodigo: rows[0].empresaCodigo, // Código de la empresa
            idMovimiento: rows[0].idMovimiento, // ID del movimiento
            movimientoNombre: rows[0].movimientoNombre, // Nombre del movimiento
            idProducto: rows[0].idProducto, // ID del producto
            productoNombre: rows[0].productoNombre, // Nombre del producto
            idMoneda: rows[0].idMoneda, // ID de la moneda
            monedaCodigo: rows[0].monedaCodigo, // Código de la moneda
            idUsuario: rows[0].idUsuario, // ID del usuario
            usuarioNombre: rows[0].usuarioNombre, // Nombre del usuario
            fecha: rows[0].fecha,
            factura: rows[0].factura,
            ctd_entradas: rows[0].ctd_entradas,
            pu_entrada: rows[0].pu_entrada,
            concepto: rows[0].concepto,
            anaquel: rows[0].anaquel,
            seccion: rows[0].seccion,
            caja: rows[0].caja,
            observaciones: rows[0].observaciones,
            inicial: rows[0].inicial,
            precio_inicial: rows[0].precio_inicial
        };

        res.status(200).json(registro); // Retornar el registro formateado
    } catch (error) {
        console.error('Error al obtener el registro:', error);
        res.status(500).json({ message: 'Error al obtener el registro.' });
    }
};

// Obtener todos los registros de almacen
exports.obtenerRegistrosAlmacen = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.idAlmacen, 
                c.username AS idUsuario, 
                e.codigo AS idEmpresa, 
                m.nombre AS idMovimiento, 
                a.fecha, 
                p.nombre AS idProducto,  
                a.factura, 
                b.codigo AS idMoneda, 
                p.inicial, -- Ahora tomado de producto
                p.precio_inicial, -- Ahora tomado de producto
                a.ctd_entradas, 
                a.pu_entrada, 
                a.concepto, 
                a.anaquel, 
                a.seccion, 
                a.caja, 
                a.observaciones
            FROM entrada a
            JOIN users c ON a.idUsuario = c.id
            JOIN empresa e ON a.idEmpresa = e.idEmpresa
            JOIN movimiento m ON a.idMovimiento = m.idMovimiento
            JOIN producto p ON a.idProducto = p.idProducto -- Ajuste aquí
            JOIN moneda b ON a.idMoneda = b.idMoneda
            ORDER BY a.idAlmacen ASC -- Ordenar por idAlmacen en orden ascendente
        `;

        const [registros] = await db.execute(query);
        res.json({ mensaje: "Registros de almacén obtenidos", registros });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los registros de almacén", error });
    }
};

// Buscar un registro de entrada por ID
exports.obtenerRegistroPorId = async (req, res) => {
    const { idMov } = req.params; // ID del registro de entrada
    try {
        const query = `
            SELECT 
                e.idAlmacen, 
                e.idUsuario, 
                e.idEmpresa, 
                e.idMovimiento, 
                e.fecha,
                e.idProducto, 
                p.inicial AS inicial, -- 🔹 Stock disponible del producto
                u.username AS idUsuario,  -- 🔹 Nombre del usuario
                emp.codigo AS idEmpresa,  -- 🔹 Código de la empresa
                m.nombre AS idMovimiento, -- 🔹 Nombre del movimiento
                p.nombre AS idProducto,  -- 🔹 Nombre del producto
                p.pedido,                    -- 🔹 Pedido del producto
                p.marca,                     -- 🔹 Marca del producto
                p.idProveedor,               -- 🔹 ID del proveedor
                prov.nombre AS idProveedor, -- 🔹 Nombre del proveedor
                p.no_parte,                  -- 🔹 Número de parte
                p.no_serie,                  -- 🔹 Número de serie
                p.modelo,                    -- 🔹 Modelo del producto
                p.equipo,                    -- 🔹 Equipo relacionado
                p.precio_inicial             -- 🔹 Precio inicial del producto
            FROM entrada e
            JOIN empresa emp ON e.idEmpresa = emp.idEmpresa
            JOIN movimiento m ON e.idMovimiento = m.idMovimiento
            JOIN producto p ON e.idProducto = p.idProducto
            JOIN proveedor prov ON p.idProveedor = prov.idProveedor -- 🔹 Unir con la tabla proveedor
            JOIN users u ON e.idUsuario = u.id
            WHERE e.idAlmacen = ?`;

        const [rows] = await db.execute(query, [idMov]);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro obtenido', registro: rows[0] });
    } catch (error) {
        console.error("Error al obtener el registro:", error);
        res.status(500).json({ mensaje: 'Error al obtener el registro por ID', error });
    }
};

exports.eliminarRegistro = async (req, res) => {
    const { id } = req.params;
    try {
        // 1️⃣ Obtener el idProducto y ctd_entradas antes de eliminar el registro
        const [registro] = await db.query(
            'SELECT idProducto, ctd_entradas FROM entrada WHERE idAlmacen = ?',
            [id]
        );

        if (registro.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        const { idProducto, ctd_entradas } = registro[0];

        // 2️⃣ Eliminar el registro de la tabla entrada
        await db.query('DELETE FROM entrada WHERE idAlmacen = ?', [id]);

        // 3️⃣ Restar la cantidad eliminada en la tabla producto
        await db.query(
            'UPDATE producto SET inicial = inicial - ? WHERE idProducto = ?',
            [ctd_entradas, idProducto]
        );

        res.status(200).json({ message: 'Registro eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
        res.status(500).json({ message: 'Error al eliminar el registro.' });
    }
};

exports.editarRegistroAlmacen = async (req, res) => {
    const {
        idAlmacen, idUsuario, idEmpresa, idMovimiento, fecha, idProducto, factura, idMoneda,
        ctd_entradas, pu_entrada, concepto, anaquel, seccion, caja, observaciones
    } = req.body;

    try {
        // 📌 1️⃣ Obtener el registro original
        const [registroAnterior] = await db.query(
            'SELECT idProducto, ctd_entradas FROM entrada WHERE idAlmacen = ?',
            [idAlmacen]
        );

        if (registroAnterior.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado.' });
        }

        const { idProducto: idProductoAnterior, ctd_entradas: ctdEntradasAnterior } = registroAnterior[0];

        // 📌 2️⃣ Ajustar la cantidad en inventario si cambió el producto
        if (idProducto !== idProductoAnterior) {
            await db.query(
                'UPDATE producto SET inicial = inicial - ? WHERE idProducto = ?',
                [ctdEntradasAnterior, idProductoAnterior]
            );
            await db.query(
                'UPDATE producto SET inicial = inicial + ? WHERE idProducto = ?',
                [ctd_entradas, idProducto]
            );
        } else {
            const diferencia = ctd_entradas - ctdEntradasAnterior;
            await db.query(
                'UPDATE producto SET inicial = inicial + ? WHERE idProducto = ?',
                [diferencia, idProducto]
            );
        }

        // 📌 3️⃣ Actualizar la entrada en la tabla 'entrada'
        await db.query(`
            UPDATE entrada SET
        idUsuario = ?, idEmpresa = ?, idMovimiento = ?, fecha = ?, idProducto = ?,
            factura = ?, idMoneda = ?, ctd_entradas = ?, pu_entrada = ?, concepto = ?,
            anaquel = ?, seccion = ?, caja = ?, observaciones = ?
                WHERE idAlmacen = ?
                    `, [
            idUsuario, idEmpresa, idMovimiento, fecha, idProducto, factura, idMoneda, 
            ctd_entradas, pu_entrada, concepto, anaquel, seccion, caja, observaciones, idAlmacen
        ]);

        res.json({ message: 'Registro actualizado correctamente.' });

    } catch (error) {
        console.error('Error al editar el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.registrarSalida = async (req, res) => {
    const { idAlmacen } = req.params;
    const {
        folio_vale_salida,
        ctd_salidas,
        precio_salidas,
        solicito,
        servicio,
        aplicacion,
        uso_en,
        recibio,
        condicion
    } = req.body;

    try {
        // 1️⃣ Registrar la salida
        const querySalida = `
            INSERT INTO salida (
                idAlmacen, folio_vale_salida, ctd_salidas, precio_salidas,
                solicito, servicio, aplicacion, uso_en, recibio, condicion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(querySalida, [
            idAlmacen, folio_vale_salida, ctd_salidas, precio_salidas,
            solicito, servicio, aplicacion, uso_en, recibio, condicion
        ]);

        // 2️⃣ Obtener el idProducto asociado a esta entrada
        const [producto] = await db.query(
            'SELECT idProducto FROM entrada WHERE idAlmacen = ?',
            [idAlmacen]
        );

        if (!producto.length) {
            return res.status(404).json({ mensaje: 'No se encontró el producto asociado' });
        }

        const idProducto = producto[0].idProducto;

        // 3️⃣ Actualizar el stock del producto
        await db.query(
            'UPDATE producto SET inicial = inicial - ? WHERE idProducto = ?',
            [ctd_salidas, idProducto]
        );

        // 4️⃣ Responder con éxito
        res.status(200).json({
            mensaje: 'Salida registrada con éxito',
            idAlmacen: idAlmacen,
            idProducto: idProducto
        });

    } catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ mensaje: 'Error al registrar la salida', error });
    }
};

exports.registrarCondicion = async (req, res) => {
    const { condiciones } = req.body;
    if (!condiciones) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    try {
        // 1️⃣ Verificar si el código de la moneda ya existe
        const queryCheck = 'SELECT * FROM condicion WHERE condiciones = ?';
        const [rows] = await db.query(queryCheck, [condiciones]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'La condición ya está registrada. Intenta con otro.' });
        }
        // 2️⃣ Insertar la nueva moneda si no existe
        const queryInsert = 'INSERT INTO condicion (condiciones) VALUES (?)';
        await db.query(queryInsert, [condiciones]);
        res.status(201).json({ message: 'Condición registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar la condición:', error);
        res.status(500).json({ message: 'Error al registrar la condición.' });
    }
};

// Obtener todas las condiciones
exports. obtenerCondiciones = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM condicion');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las condiciones' });
    }
};

// Eliminar una condición
exports.eliminarCondicion = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM condicion WHERE idCondicion = ?', [id]);
        res.json({ message: 'Condición eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la condición' });
    }
};

exports.obtenerCondicionPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultado] = await db.query('SELECT * FROM condicion WHERE idCondicion = ?', [id]);
        if (resultado.length === 0) {
            return res.status(404).json({ message: 'Condición no encontrada' });
        }
        res.json(resultado[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la condición' });
    }
};

exports.registrarMovimiento = async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    try {
        // 1️⃣ Verificar si el movimiento ya existe en la base de datos
        const queryCheck = 'SELECT * FROM movimiento WHERE nombre = ?';
        const [rows] = await db.query(queryCheck, [nombre]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El movimiento ya está registrado. Intenta con otro nombre.' });
        }
        // 2️⃣ Insertar el movimiento si no existe
        const queryInsert = 'INSERT INTO movimiento (nombre, descripcion) VALUES (?, ?)';
        await db.query(queryInsert, [nombre, descripcion]);
        res.status(201).json({ message: 'Movimiento registrado correctamente.' });
    } catch (error) {
        console.error('Error al registrar movimiento:', error);
        res.status(500).json({ message: 'Error al registrar el movimiento.' });
    }
};

exports.obtenerMovimientos = async (req, res) => {
    try {
        const query = 'SELECT idMovimiento, nombre, descripcion FROM movimiento';
        const [rows] = await db.query(query); // En vez de db.execute()
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

// Función para buscar un movimiento por ID
exports.buscarMovimientoPorId = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'El id es obligatorio para buscar.' });
    }

    try {
        const query = 'SELECT idMovimiento, nombre, descripcion FROM movimiento WHERE idMovimiento = ?';
        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

// Función para eliminar un movimiento
exports.eliminarMovimiento = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'El id es obligatorio para eliminar el movimiento.' });
    }

    try {
        const queryCheck = 'SELECT * FROM movimiento WHERE idMovimiento = ?';
        const [rows] = await db.query(queryCheck, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento no encontrado.' });
        }

        const queryDelete = 'DELETE FROM movimiento WHERE idMovimiento = ?';
        await db.query(queryDelete, [id]);
        res.status(200).json({ message: 'Movimiento eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar movimiento:', error);
        res.status(500).json({ message: 'Error al eliminar el movimiento.' });
    }
};

exports.registrarProveedor = async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // 1️⃣ Verificar si el código de la moneda ya existe
        const queryCheck = 'SELECT * FROM proveedor WHERE nombre = ?';
        const [rows] = await db.query(queryCheck, [nombre]);

        if (rows.length > 0) {
            return res.status(400).json({ message: 'El código del proveedor ya está registrado. Intenta con otro.' });
        }

        // 2️⃣ Insertar la nueva moneda si no existe
        const queryInsert = 'INSERT INTO proveedor (nombre) VALUES (?)';
        await db.query(queryInsert, [nombre]);

        res.status(201).json({ message: 'Proveedor registrado correctamente.' });

    } catch (error) {
        console.error('Error al registrar el proveedor:', error);
        res.status(500).json({ message: 'Error al registrar el proveedor.' });
    }
};

exports.obtenerProveedorPorId = async (req, res) => {
    const { idProveedor } = req.params;

    try {
        const query = 'SELECT * FROM proveedor WHERE idProveedor = ?';
        const [rows] = await db.query(query, [idProveedor]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
        }

        res.status(200).json(rows[0]); // Enviar el primer resultado encontrado
    } catch (error) {
        console.error('Error al obtener el proveedor:', error);
        res.status(500).json({ message: 'Error al obtener el proveedor.' });
    }
};

// Obtener todos los proveedores
exports.obtenerProveedores = async (req, res) => {
    try {
        const [proveedores] = await db.query('SELECT * FROM proveedor');
        // Si no se encuentran proveedores, devuelve un error 404
        if (proveedores.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron proveedores" });
        }
        // Devuelve los proveedores encontrados con el código de estado 200
        res.status(200).json(proveedores);
    } catch (error) {
        console.error("Error al obtener los proveedores:", error);
        res.status(500).json({ mensaje: "Error en el servidor", error });
    }
};

exports.eliminarProveedor = async (req, res) => {
    const { id } = req.params; // Obtener el ID del proveedor desde la URL
    if (!id) {
        return res.status(400).json({ message: 'ID del proveedor requerido.' });
    }
    try {
        const result = await db.query('DELETE FROM proveedor WHERE idProveedor = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado.' });
        }
        res.json({ message: 'Proveedor eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Ruta para obtener los proveedores
exports.seleccionarProveedor = async (req, res) => {
    try {
        const query = 'SELECT idProveedor, nombre FROM proveedor'; // Ajusta según tu base de datos
        const [rows] = await db.execute(query);
        res.status(200).json(rows); // Enviar la lista de proveedor como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los proveedores', error });
    }
};

// Registrar un nuevo producto
exports.registrarProducto = async (req, res) => {
    const { nombre, descripcion, pedido, marca, idProveedor, no_parte, no_serie, modelo, equipo, inicial, precio_inicial } = req.body;

    if (!nombre || !descripcion || !pedido || !marca || !idProveedor || !no_parte || !no_serie || !modelo || !equipo || !inicial || !precio_inicial) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        // 1️⃣ Verificar si el producto ya existe
        const queryCheck = 'SELECT nombre FROM producto WHERE nombre = ?';
        const [rows] = await db.query(queryCheck, [nombre]);

        if (rows.length > 0) {
            return res.status(400).json({ message: 'El producto ya está registrado. Intenta con otro.' });
        }

        // 2️⃣ Insertar el nuevo producto si no existe
        const queryInsert = 'INSERT INTO producto (nombre, descripcion, pedido, marca, idProveedor, no_parte, no_serie, modelo, equipo, inicial, precio_inicial) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(queryInsert, [nombre, descripcion, pedido, marca, idProveedor, no_parte, no_serie, modelo, equipo, inicial, precio_inicial]);

        res.status(201).json({ message: 'Producto registrado correctamente.' });

    } catch (error) {
        console.error('Error al registrar el producto:', error);
        res.status(500).json({ message: 'Error al registrar el producto.' });
    }
};

// Obtener un producto por ID
exports.obtenerProductoPorId = async (req, res) => {
    const { idProducto } = req.params;

    try {
        const query = 'SELECT nombre, descripcion, pedido, marca, idProveedor, no_parte, no_serie, modelo, equipo, inicial, precio_inicial FROM producto WHERE idProducto = ?';
        const [rows] = await db.query(query, [idProducto]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        res.status(200).json(rows[0]); // Enviar el primer resultado encontrado
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto.' });
    }
};

exports.obtenerProducto = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [producto] = await db.query(
            'SELECT inicial, precio_inicial FROM producto WHERE idProducto = ?',
            [id]
        );

        if (producto.length > 0) {
            res.json(producto[0]); // Devolvemos el primer resultado
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query('SELECT a.idProducto, a.nombre, a.descripcion, a.pedido, a.marca, pr.nombre AS idProveedor, a.no_parte, a.no_serie, a.modelo, a.equipo, a.inicial, a.precio_inicial FROM producto a JOIN proveedor pr ON a.idProveedor = pr.idProveedor');

        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos.' });
        }

        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ message: 'Error en el servidor.', error });
    }
};

// Eliminar un producto por ID
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID del producto requerido.' });
    }

    try {
        const result = await db.query('DELETE FROM producto WHERE idProducto = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        res.json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Ruta para obtener los productos
exports.seleccionarProductos = async (req, res) => {
    try {
        const query = 'SELECT idProducto, nombre FROM producto'; // Ajusta según tu base de datos
        const [rows] = await db.execute(query);
        res.status(200).json(rows); // Enviar la lista de proveedor como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos', error });
    }
};

// Obtener el vale por ID
exports.obtenerValePorId = async (req, res) => {
    const { idAlmacen } = req.params;
    try {
        const query = `
            SELECT
        a.idAlmacen, a.folio_vale_salida, a.solicito, p.nombre AS producto, a.marca,
            a.no_serie, a.no_parte, a.modelo, a.ctd_salidas, a.servicio,
            a.uso_en, pr.condiciones AS condicion
            FROM almacen a
            JOIN producto p ON a.producto = p.idProducto
            JOIN condicion pr ON a.condicion = pr.idCondicion
            WHERE a.idAlmacen = ? `;

        const [rows] = await db.execute(query, [idAlmacen]);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        // Obtener la fecha de hoy en formato yyyy-MM-dd
        const fechaHoy = new Date().toISOString().split('T')[0];

        // Agregar la fecha de hoy a la respuesta
        res.json({
            mensaje: 'Registro obtenido',
            registro: rows[0],
            fechaHoy: fechaHoy // Fecha actual
        });
    } catch (error) {
        console.error("Error al obtener el registro:", error);
        res.status(500).json({ mensaje: 'Error al obtener el registro por ID', error });
    }
};

// Guardar o actualizar el vale
exports.guardarVale = async (req, res) => {
    const { idAlmacen, entrego, recibio, observacion } = req.body;

    // Validar que los valores no sean undefined
    if (!idAlmacen || !entrego || !recibio || !observacion) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
    }

    const fechaHoy = new Date().toISOString().split('T')[0];

    try {
        const query = `
            INSERT INTO vale(idAlmacen, entrego, recibio, observacion, fecha)
        VALUES(?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
        entrego = VALUES(entrego),
            recibio = VALUES(recibio),
            observacion = VALUES(observacion),
            fecha = VALUES(fecha)`;

        await db.execute(query, [idAlmacen, entrego, recibio, observacion, fechaHoy]);

        res.json({ mensaje: "Vale guardado correctamente" });
    } catch (error) {
        console.error("Error al guardar el vale:", error);
        res.status(500).json({ mensaje: "Error al guardar el vale", error });
    }
};

// Ruta para obtener las usuarios
exports.obtenerUsers = async (req, res) => {
    try {
        // Consulta para obtener los nombres de los users y guardar el id
        const query = 'SELECT id, username FROM users'; // Ajusta los campos según tu base de datos
        const [rows] = await db.execute(query);

        res.status(200).json(rows); // Enviar la lista de users como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los users', error });
    }
};

// Controlador para obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
    const userId = req.params.id; // Obtener el ID del usuario desde los parámetros de la URL

    try {
        // Consulta para obtener el usuario por su ID
        const query = 'SELECT id, username FROM users WHERE id = ?'; // Ajusta los campos según tu base de datos
        const [rows] = await db.execute(query, [userId]);

        if (rows.length > 0) {
            // Si se encuentra el usuario, devolver sus datos
            res.status(200).json(rows[0]);
        } else {
            // Si no se encuentra el usuario, devolver un error 404
            res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
    } catch (error) {
        // Manejar errores de la base de datos
        res.status(500).json({ mensaje: 'Error al obtener el usuario', error });
    }
};

// Ruta para obtener las OT
exports.obtenerOT = async (req, res) => {
    try {
        // Consulta para obtener los nombres de los users y guardar el id
        const query = 'SELECT id, clave FROM registros'; // Ajusta los campos según tu base de datos
        const [rows] = await db.execute(query);

        res.status(200).json(rows); // Enviar la lista de users como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros', error });
    }
};