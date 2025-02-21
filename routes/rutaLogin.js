const express = require('express');
const router = express.Router();
const loginController = require('../controllers/authController');

router.post('/login', loginController.login);
router.post('/registroUsusario', loginController.register);
router.get('/validar/:token', loginController.validarCuenta); // Nueva ruta
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
router.get('/listaEmpleados', loginController.listaEmpleados);
=======

>>>>>>> def00b5 (commit perfiles)
=======
router.get('/listaEmpleados', loginController.listaEmpleados);
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======
router.get('/listaEmpleados', loginController.listaEmpleados);
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
module.exports = router;
