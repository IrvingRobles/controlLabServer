const express = require('express'); 
const bodyParser = require('body-parser');
const path = require('path'); // Para resolver las rutas de los archivos estáticos
const cors = require('cors'); // Importar cors
const rutaRegistro = require('./routes/rutaRegistro');

const app = express();
const port = 3000;

// Configuración de CORS
const corsOptions = {
    origin: '*', // Permitir acceso desde cualquier origen. Cambia '*' por un dominio específico si es necesario.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

app.use(cors(corsOptions)); // Aplicar configuración de CORS

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
