const db = require('../model/db'); // Configuración de la base de datos

// Obtener todos los registros
exports.obtenerTodosRM = async (req, res) => {
    try {
        const query = 'SELECT * FROM registro_equipos';
        const [registros] = await db.execute(query);
        res.json({ mensaje: 'Registros obtenidos', registros });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los registros', error });
    }
};

// Obtener un registro por ID
exports.obtenerRM = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM registro_equipos WHERE id = ?';
        const [registro] = await db.execute(query, [id]);

        if (registro.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro obtenido', registro: registro[0] });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el registro', error });
    }
};

// Obtener el siguiente folio
const obtenerSiguienteFolio = async () => {
    const query = 'SELECT MAX(folio) AS ultimoFolio FROM registro_equipos';
    const [resultado] = await db.execute(query);
    return (resultado[0].ultimoFolio || 0) + 1; // Si no hay registros, inicia en 1
};

// Crear un nuevo registro asegurando datos en mayúsculas y folio continuo
exports.crearRM = async (req, res) => {
    try {
        const folio = await obtenerSiguienteFolio();
        let {
            fecha_ingreso, responsable_ingreso, nombre_cliente, orden_trabajo, descripcion_equipo,
            marca, modelo, numero_serie, motivo_ingreso, fecha_compromiso, acciones_realizadas,
            fecha_envio, fecha_regreso, proveedor, fecha_egreso, responsable_egreso,
            diagnostico, cotizacion, fecha_cotizacion, monto, referencia, observaciones
        } = req.body;

        // Convertir todos los valores de texto a mayúsculas
        responsable_ingreso = responsable_ingreso.toUpperCase();
        nombre_cliente = nombre_cliente.toUpperCase();
        orden_trabajo = orden_trabajo.toUpperCase();
        descripcion_equipo = descripcion_equipo.toUpperCase();
        marca = marca.toUpperCase();
        modelo = modelo.toUpperCase();
        numero_serie = numero_serie.toUpperCase();
        motivo_ingreso = motivo_ingreso.toUpperCase();
        proveedor = proveedor.toUpperCase();
        responsable_egreso = responsable_egreso.toUpperCase();
        diagnostico = diagnostico.toUpperCase();
        cotizacion = cotizacion.toUpperCase();
        referencia = referencia.toUpperCase();
        observaciones = observaciones.toUpperCase();

        const query = `INSERT INTO registro_equipos 
            (folio, fecha_ingreso, responsable_ingreso, nombre_cliente, orden_trabajo, descripcion_equipo, 
            marca, modelo, numero_serie, motivo_ingreso, fecha_compromiso, acciones_realizadas, 
            fecha_envio, fecha_regreso, proveedor, fecha_egreso, responsable_egreso, 
            diagnostico, cotizacion, fecha_cotizacion, monto, referencia, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const valores = [
            folio, fecha_ingreso, responsable_ingreso, nombre_cliente, orden_trabajo, descripcion_equipo,
            marca, modelo, numero_serie, motivo_ingreso, fecha_compromiso, acciones_realizadas,
            fecha_envio, fecha_regreso, proveedor, fecha_egreso, responsable_egreso,
            diagnostico, cotizacion, fecha_cotizacion, monto, referencia, observaciones
        ];

        await db.execute(query, valores);
        res.status(201).json({ mensaje: 'Registro creado correctamente', folio });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear el registro', error });
    }
};

// Actualizar un registro por ID
exports.actualizarRM = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ mensaje: 'ID no proporcionado' });
        }

        let {
            folio, fecha_ingreso, responsable_ingreso, nombre_cliente, orden_trabajo, descripcion_equipo,
            marca, modelo, numero_serie, motivo_ingreso, fecha_compromiso, acciones_realizadas,
            fecha_envio, fecha_regreso, proveedor, fecha_egreso, responsable_egreso,
            diagnostico, cotizacion, fecha_cotizacion, monto, referencia, observaciones
        } = req.body;

        // Verificar si el registro existe
        const [registroExistente] = await db.execute('SELECT id FROM registro_equipos WHERE id = ?', [id]);
        if (registroExistente.length === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        // Convertir los valores a mayúsculas si existen, de lo contrario, asignar NULL
        const convertirMayusculas = (valor) => (valor ? valor.toUpperCase() : null);
        
        responsable_ingreso = convertirMayusculas(responsable_ingreso);
        nombre_cliente = convertirMayusculas(nombre_cliente);
        orden_trabajo = convertirMayusculas(orden_trabajo);
        descripcion_equipo = convertirMayusculas(descripcion_equipo);
        marca = convertirMayusculas(marca);
        modelo = convertirMayusculas(modelo);
        numero_serie = convertirMayusculas(numero_serie);
        motivo_ingreso = convertirMayusculas(motivo_ingreso);
        proveedor = convertirMayusculas(proveedor);
        responsable_egreso = convertirMayusculas(responsable_egreso);
        diagnostico = convertirMayusculas(diagnostico);
        cotizacion = convertirMayusculas(cotizacion);
        referencia = convertirMayusculas(referencia);
        observaciones = convertirMayusculas(observaciones);

        // Función para validar fechas (convertir a formato 'YYYY-MM-DD' o NULL)
        const formatearFecha = (fecha) => (fecha ? new Date(fecha).toISOString().split("T")[0] : null);

        fecha_ingreso = formatearFecha(fecha_ingreso);
        fecha_compromiso = formatearFecha(fecha_compromiso);
        fecha_envio = formatearFecha(fecha_envio);
        fecha_regreso = formatearFecha(fecha_regreso);
        fecha_egreso = formatearFecha(fecha_egreso);
        fecha_cotizacion = formatearFecha(fecha_cotizacion);

        // Verificar si hay cambios antes de actualizar
        const updateQuery = `
            UPDATE registro_equipos SET 
                folio = ?, fecha_ingreso = ?, responsable_ingreso = ?, nombre_cliente = ?, orden_trabajo = ?, 
                descripcion_equipo = ?, marca = ?, modelo = ?, numero_serie = ?, motivo_ingreso = ?, 
                fecha_compromiso = ?, acciones_realizadas = ?, fecha_envio = ?, fecha_regreso = ?, 
                proveedor = ?, fecha_egreso = ?, responsable_egreso = ?, diagnostico = ?, cotizacion = ?, 
                fecha_cotizacion = ?, monto = ?, referencia = ?, observaciones = ? 
            WHERE id = ?`;

        const valores = [
            folio || null, fecha_ingreso, responsable_ingreso, nombre_cliente, orden_trabajo, descripcion_equipo,
            marca, modelo, numero_serie, motivo_ingreso, fecha_compromiso, acciones_realizadas || null,
            fecha_envio, fecha_regreso, proveedor, fecha_egreso, responsable_egreso,
            diagnostico, cotizacion, fecha_cotizacion, monto || 0, referencia, observaciones, id
        ];

        const [resultado] = await db.execute(updateQuery, valores);

        if (resultado.affectedRows === 0) {
            return res.status(200).json({ mensaje: 'No se realizaron cambios en el registro' });
        }

        res.json({ mensaje: 'Registro actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el registro', error: error.message });
    }
};


// Eliminar un registro por ID
exports.eliminarRM = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM registro_equipos WHERE id = ?';
        const [resultado] = await db.execute(query, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.json({ mensaje: 'Registro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el registro', error });
    }
};
exports.obtenerUltimoFolio = async (req, res) => {
    try {
        const query = 'SELECT MAX(folio) AS ultimoFolio FROM registro_equipos';
        const [resultado] = await db.execute(query);
        res.json({ ultimo_folio: resultado[0].ultimoFolio || 0 });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el último folio', error });
    }
};
