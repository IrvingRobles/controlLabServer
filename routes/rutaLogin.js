const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.post('/login', loginController.login);
router.post('/registroUsusario', loginController.register);
router.get('/validar/:token', loginController.validarCuenta); // Nueva ruta
<<<<<<< HEAD
<<<<<<< HEAD
router.get('/listaEmpleados', loginController.listaEmpleados);
=======

>>>>>>> def00b5 (commit perfiles)
=======
router.get('/listaEmpleados', loginController.listaEmpleados);
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
module.exports = router;
