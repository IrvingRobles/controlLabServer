// routes/rutaRegistro.js
const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const otcController = require('../controllers/cotizacionesController');
const registrosMaterialesController = require('../controllers/registrosMaterialesController');

router.get('/listaMateriales', registrosMaterialesController.obtenerTodosRM); 
router.get('/obtenerMaterial/:id', registrosMaterialesController.obtenerRM);
router.post('/crearMaterial', registrosMaterialesController.crearRM);
router.put('/actualizarMaterial/:id', registrosMaterialesController.actualizarRM);
router.delete('/eliminarMaterial/:id', registrosMaterialesController.eliminarRM);
router.get('/ultimoFolio', registrosMaterialesController.obtenerUltimoFolio); // Asegúrate de agregar esta función

// Ruta para crear un nuevo registro
router.post('/crear', registroController.crearRegistro);
router.post('/crearCliente', registroController.crearCliente);
router.get('/obtenerClientes', registroController.obtenerClientes);
router.get('/listaClientes', registroController.listarClientes);
router.get("/obtenerCliente/:id_cliente", registroController.obtenerCliente);

router.put("/actualizarCliente/:id_cliente", registroController.actualizarCliente);
router.delete("/eliminarCliente/:id_cliente", registroController.eliminarCliente);


// Ruta para obtener todos los registros
router.get('/obtener', registroController.obtenerRegistros);

// Ruta para obtener un registro específico por ID
router.get('/obtener/:id', registroController.obtenerRegistroPorId);

// Ruta para actualizar un registro por ID
router.put('/actualizar/:id', registroController.actualizarRegistro);

// Ruta para eliminar un registro por ID
router.delete('/eliminar/:id', registroController.eliminarRegistro);

// Ruta para asignar personal a un registro
router.put('/asignar/:id', registroController.asignarPersonal);

// Ruta para obtener la lista de empleados
router.get('/empleados', registroController.obtenerEmpleados);

router.get('/obtenerAsignados', registroController.obtenerRegistroAsignado);

console.log(registroController); // <-- Agrega esto para verificar en la consola

// Definir rutas
router.get('/obtenerOT', registroController.cargarDatosOT);
router.post('/guardarOT', registroController.guardarOT);
router.put('/actualizarOT', registroController.actualizarOT);

// Ruta para obtener la Orden de Trabajo y sus cotizaciones
router.get('/otc/:id', otcController.obtenerOTC);

router.post('/cotizacion', otcController.guardarCotizacion);
router.delete('/material/:id', otcController.eliminarMaterial);

// Ruta para actualizar la Orden de Trabajo y sus cotizaciones
//router.put('/otc', otcController.guardarOTC);  // Usamos PUT ya que la lógica maneja tanto creación como actualización

module.exports = router;
