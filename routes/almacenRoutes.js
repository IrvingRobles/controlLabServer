// routes/almacenRoutes.js
const express = require('express');
const router = express.Router();
const almacenController = require('../controllers/almacenController');

// Ruta para crear un nuevo registro
router.post('/entrada', almacenController.crearRegistroAlmacen); 

router.get('/obtener', almacenController.obtenerRegistrosAlmacen);

router.get('/siguiente-id', almacenController.obtenerSiguienteIdAlmacen);

router.get('/moneda', almacenController.obtenerMonedas);

router.post('/monedas', almacenController.registrarMoneda);

router.get('/monedas/:id', almacenController.obtenerMonedaPorId);

router.delete('/monedas/:id', almacenController.eliminarMoneda);

// Ruta para buscar registro por ID Mov
router.get('/:idMov', almacenController.obtenerRegistroPorId);

// Ruta para registrar salidas vinculadas a un ID Mov
router.post('/:idMov/salida', almacenController.registrarSalida);

// Ruta para registrar una empresa
router.post('/empresas', almacenController.registrarEmpresa);

router.get('/id/empresas', almacenController.obtenerEmpresas);

router.get('/empresas/:id', almacenController.obtenerEmpresaPorId);

router.delete('/empresas/:id', almacenController.eliminarEmpresa);

//Registrar Movimiento
router.post('/movimiento', almacenController.registrarMovimiento);

// Obtener movimientos
router.get('/id/movimientos', almacenController.obtenerMovimientos);

// Buscar un movimiento por ID
router.get('/movimiento/id/:id', almacenController.buscarMovimientoPorId);

// Eliminar un movimiento por ID
router.delete('/movimiento/:id', almacenController.eliminarMovimiento);

router.post('/condicion', almacenController.registrarCondicion);

router.get('/condiciones/id', almacenController.obtenerCondiciones);

router.delete('/condicion/id/:id', almacenController.eliminarCondicion);

router.get('/x/condicion/:id', almacenController.obtenerCondicionPorId);

router.post('/proveedor', almacenController.registrarProveedor);

router.get('/proveedor/id/:idProveedor', almacenController.obtenerProveedorPorId);

router.get('/id/proveedores', almacenController.obtenerProveedores); // Nueva ruta para listar todos

// Ruta para eliminar proveedor por ID
router.delete('/proveedor/:id', almacenController.eliminarProveedor);

router.get('/proveedorselect/id', almacenController.seleccionarProveedor);

// Registrar un nuevo producto
router.post('/producto', almacenController.registrarProducto);

// Obtener un producto por su ID
router.get('/producto/id/:idProducto', almacenController.obtenerProductoPorId); 

// Ruta para obtener inicial y precio_inicial de un producto
router.get('/producto/:id', almacenController.obtenerProducto);

// Obtener todos los productos
router.get('/productos/id', almacenController.obtenerProductos);

// Eliminar un producto por su ID
router.delete('/producto/:id', almacenController.eliminarProducto);

router.get('/productoselect/id', almacenController.seleccionarProductos);

// Ruta para buscar registro por ID Mov
router.get('/id/:idAlmacen', almacenController.obtenerValePorId);

router.post('/vales/guardar', almacenController.guardarVale);

module.exports = router;