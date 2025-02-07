// routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');

// Ruta para crear un nuevo registro
router.post('/entrada', almacenController.crearRegistroAlmacen); 

router.get('/obtener', almacenController.obtenerRegistrosAlmacen);

router.get('/siguiente-id', almacenController.obtenerSiguienteIdAlmacen);

router.get('/moneda', almacenController.obtenerMonedas);

// Ruta para buscar registro por ID Mov
router.get('/:idMov', almacenController.obtenerRegistroPorId);

// Ruta para registrar salidas vinculadas a un ID Mov
router.post('/:idMov/salida', almacenController.registrarSalida);

router.post('/monedas', almacenController.registrarMoneda);

// Ruta para registrar una empresa
router.post('/empresa', almacenController.registrarEmpresa);

//Registrar Movimiento
router.post('/movimiento', almacenController.registrarMovimiento);

//Obtener movimientos
router.get('/movimientos', almacenController.obtenerMovimientos)

module.exports = router;