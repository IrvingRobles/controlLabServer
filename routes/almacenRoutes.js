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
router.post('/empresas', almacenController.registrarEmpresa);

//Registrar Movimiento
router.post('/movimiento', almacenController.registrarMovimiento);

// Obtener movimientos
router.get('/id/movimientos', almacenController.obtenerMovimientos);

router.get('/id/empresa', almacenController.obtenerEmpresas);

router.post('/condicion', almacenController.registrarCondicion);

router.post('/proveedor', almacenController.registrarProveedor);

router.get('/proveedor/id/:idProveedor', almacenController.obtenerProveedorPorId);

router.get('/id/proveedores', almacenController.obtenerProveedores); // Nueva ruta para listar todos

// Ruta para eliminar proveedor por ID
router.delete('/proveedor/:id', almacenController.eliminarProveedor);

router.get('/id/proveedorselect', almacenController.seleccionarProveedor);

module.exports = router;