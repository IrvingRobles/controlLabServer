// routes/rutaRegistro.js
const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

const otcController = require('../controllers/cotizacionesController');

// Ruta para crear un nuevo registro
router.post('/crear', registroController.crearRegistro);

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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8810c29 (commit campos OT)
console.log(registroController); // <-- Agrega esto para verificar en la consola

// Definir rutas
router.get('/obtenerOT', registroController.cargarDatosOT);
router.post('/guardarOT', registroController.guardarOT);
<<<<<<< HEAD
router.put('/actualizarOT', registroController.actualizarOT);

// Ruta para obtener la Orden de Trabajo y sus cotizaciones
router.get('/otc/:id', otcController.obtenerOTC);

router.post('/cotizacion', otcController.guardarCotizacion);
router.delete('/material/:id', otcController.eliminarMaterial);

// Ruta para actualizar la Orden de Trabajo y sus cotizaciones
//router.put('/otc', otcController.guardarOTC);  // Usamos PUT ya que la lógica maneja tanto creación como actualización

=======
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======

>>>>>>> 8810c29 (commit campos OT)
module.exports = router;
