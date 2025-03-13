const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');
const personalController = require('../controllers/personalController');

router.post('/login', loginController.login);
router.post('/registroUsuario', loginController.register);
router.get('/validar/:token', loginController.validarCuenta); 
router.get('/listaEmpleados',personalController.listaEmpleados);

// Obtener un empleado por ID
router.get('/empleado/:id', personalController.obtenerEmpleadoPorId);

// Crear un nuevo empleado
router.post('/crearEmpleado', personalController.crearEmpleado);

// Actualizar un empleado
router.put('/actualizarEmpleado/:id', personalController.actualizarEmpleado);

// Eliminar un empleado
router.delete('/eliminarEmpleado/:id', personalController.eliminarEmpleado);


module.exports = router;
