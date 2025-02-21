// routes/rutaRegistro.js
const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
const otcController = require('../controllers/cotizacionesController');
=======
const registroCotizaciones = require('../controllers/cotizacionesController');
>>>>>>> f516e26 (commit pdf OT)
=======
const otcController = require('../controllers/cotizacionesController');
>>>>>>> 259ac88 (COMMIT AUTORELLENO DE DATOS COTIZACION)
=======
const otcController = require('../controllers/cotizacionesController');
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47

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
<<<<<<< HEAD
=======
>>>>>>> 8810c29 (commit campos OT)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
console.log(registroController); // <-- Agrega esto para verificar en la consola

// Definir rutas
router.get('/obtenerOT', registroController.cargarDatosOT);
router.post('/guardarOT', registroController.guardarOT);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
router.put('/actualizarOT', registroController.actualizarOT);
=======
router.put('/actualizarOT', registroController.actualizarOT);

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 434725f (FORMULARIO OT)
=======
router.get("/obtenerOTC/:id", registroCotizaciones.obtenerOTC);
router.post("/guardarOTC", registroCotizaciones.guardarOTC);
router.put("/guardarOTC", registroCotizaciones.guardarOTC);
>>>>>>> f516e26 (commit pdf OT)
=======
// Ruta para obtener la Orden de Trabajo y sus cotizaciones
router.get('/otc/:id', otcController.obtenerOTC);

router.post('/cotizacion', otcController.guardarCotizacion);
router.delete('/material/:id', otcController.eliminarMaterial);

// Ruta para actualizar la Orden de Trabajo y sus cotizaciones
<<<<<<< HEAD
router.put('/otc', otcController.guardarOTC);  // Usamos PUT ya que la lógica maneja tanto creación como actualización
>>>>>>> 259ac88 (COMMIT AUTORELLENO DE DATOS COTIZACION)
=======
//router.put('/otc', otcController.guardarOTC);  // Usamos PUT ya que la lógica maneja tanto creación como actualización
>>>>>>> 8c02b60 (commit cotizacion)
=======
router.put('/actualizarOT', registroController.actualizarOT);
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47

// Ruta para obtener la Orden de Trabajo y sus cotizaciones
router.get('/otc/:id', otcController.obtenerOTC);

router.post('/cotizacion', otcController.guardarCotizacion);
router.delete('/material/:id', otcController.eliminarMaterial);

// Ruta para actualizar la Orden de Trabajo y sus cotizaciones
//router.put('/otc', otcController.guardarOTC);  // Usamos PUT ya que la lógica maneja tanto creación como actualización

<<<<<<< HEAD
=======
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======

>>>>>>> 8810c29 (commit campos OT)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
module.exports = router;
