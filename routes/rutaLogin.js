const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.post('/login', loginController.login);
router.post('/registroUsusario', loginController.register);
router.get('/validar/:token', loginController.validarCuenta); // Nueva ruta
<<<<<<< HEAD
router.get('/listaEmpleados', loginController.listaEmpleados);
=======

>>>>>>> def00b5 (commit perfiles)
module.exports = router;
