// routes/rutaRegistro.js
const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

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

module.exports = router;
