// routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');

// Ruta para crear un nuevo registro
router.post('/entrada', almacenController.crearRegistroAlmacen); 

router.get('/obtener', almacenController.obtenerRegistrosAlmacen);

router.get('/siguiente-id', almacenController.obtenerSiguienteIdAlmacen);

// Ruta para buscar registro por ID Mov
router.get('/:idMov', almacenController.obtenerRegistroPorId);

// Ruta para registrar salidas vinculadas a un ID Mov
router.post('/:idMov/salida', almacenController.registrarSalida);

router.post('/monedas', almacenController.registrarMoneda);

module.exports = router;