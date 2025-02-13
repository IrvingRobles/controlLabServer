const db = require('../model/db');

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

// Ruta para obtener las monedas
exports.obtenerMonedas = async (req, res) => {
    try {
        // Consulta para obtener los nombres de las monedas y guardar el idMoneda
        const query = 'SELECT idMoneda, codigo FROM moneda'; // Ajusta los campos según tu base de datos
        const [rows] = await db.execute(query);

        res.status(200).json(rows); // Enviar la lista de monedas como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las monedas', error });
    }
};

exports.registrarEmpresa = async (req, res) => {
    try {
        const { codigo, nombre, rfc, direccion } = req.body;
        // Validación básica
        if (!codigo || !nombre || !rfc || !direccion) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }
        // 1️⃣ Verificar si el código o RFC ya existe
        const queryCheck = `SELECT * FROM empresa WHERE codigo = ? OR rfc = ?`;
        const [rows] = await db.query(queryCheck, [codigo, rfc]);
        if (rows.length > 0) {
            return res.status(400).json({ message: "Empresa o RFC ya está registrado. Intenta con otro." });
        }
        // 2️⃣ Insertar la nueva empresa si no existe
        const queryInsert = `INSERT INTO empresa (codigo, nombre, rfc, direccion) VALUES (?, ?, ?, ?)`;
        await db.query(queryInsert, [codigo, nombre, rfc, direccion]);
        res.status(201).json({ message: "¡Empresa registrada correctamente!" });
    } catch (error) {
        console.error('Error al registrar empresa:', error);
        res.status(500).json({ message: "Error en el servidor. Inténtelo de nuevo más tarde." });
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
    const { idMov } = req.params; // ID del registro a actualizar
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

        // Actualizar los datos de salida
        const queryActualizar = `
            UPDATE almacen
            SET 
                folio_vale_salida = ?,
                ctd_salidas = ?,
                precio_salidas = ?,
                solicito = ?,
                cliente = ?,
                servicio = ?,
                aplicacion = ?,
                uso_en = ?,
                recibio = ?,
                condiciones_entrega = ?
            WHERE idAlmacen = ?
        `;
        const values = [
            folio_vale_salida, ctd_salidas, precio_salidas, solicito, cliente, servicio,
            aplicacion, uso_en, recibio, condiciones_entrega, idMov
        ];

        const [result] = await db.execute(queryActualizar, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No se pudo actualizar el registro' });
        }

        res.status(200).json({ mensaje: 'Datos de salida actualizados con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar los datos de salida', error });
    }
};

exports.registrarMoneda = async (req, res) => {
    const { nombreMoneda, codigoMoneda } = req.body;
    if (!nombreMoneda || !codigoMoneda) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    try {
        // 1️⃣ Verificar si el código de la moneda ya existe
        const queryCheck = 'SELECT * FROM moneda WHERE codigo = ?';
        const [rows] = await db.query(queryCheck, [codigoMoneda]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'El código de la moneda ya está registrado. Intenta con otro.' });
        }
        // 2️⃣ Insertar la nueva moneda si no existe
        const queryInsert = 'INSERT INTO moneda (nombre, codigo) VALUES (?, ?)';
        await db.query(queryInsert, [nombreMoneda, codigoMoneda]);
        res.status(201).json({ message: 'Moneda registrada correctamente.' });
    } catch (error) {
        console.error('Error al registrar moneda:', error);
        res.status(500).json({ message: 'Error al registrar la moneda.' });
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
        const query = 'SELECT idMovimiento, nombre FROM movimiento';
        const [rows] = await db.query(query); // En vez de db.execute()
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error });
    }
};

// Ruta para obtener las empresas
exports.obtenerEmpresas = async (req, res) => {
    try {
        const query = 'SELECT idEmpresa, codigo FROM empresa'; // Ajusta según tu base de datos
        const [rows] = await db.execute(query);
        res.status(200).json(rows); // Enviar la lista de empresas como respuesta
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las empresas', error });
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