const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Para resolver las rutas de los archivos estáticos
const rutaRegistro = require('./routes/rutaRegistro');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir archivos estáticos (CSS y JS)
app.use(express.static(path.join(__dirname, 'views'))); // Carpeta 'views' donde están HTML, CSS, JS

// Usar las rutas de registro
app.use('/api/registro', rutaRegistro);

// Página principal (formulario)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
