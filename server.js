const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Para resolver las rutas de los archivos estáticos
const cors = require('cors'); // Importar cors
const multer = require('multer'); // Para manejar uploads de archivos
const fs = require('fs'); // Para manejar archivos y directorios
const rutaRegistro = require('./routes/rutaRegistro');
const almacenRoutes = require('./routes/almacenRoutes');

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

// Configuración de multer para guardar PDFs en la carpeta PDFCotizacion
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pdfPath = path.join(__dirname, 'views', 'PDFCotizacion');
        // Crear la carpeta si no existe
        if (!fs.existsSync(pdfPath)) {
            fs.mkdirSync(pdfPath, { recursive: true });
        }
        cb(null, pdfPath); // Ruta donde se guardarán los PDFs
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Guardar el archivo con su nombre original
    },
});
const upload = multer({ storage });

// Ruta para manejar la subida del PDF
app.post('/guardar-pdf', upload.single('pdf'), (req, res) => {
    if (req.file) {
        res.status(200).send('PDF guardado correctamente.');
    } else {
        res.status(500).send('Error al guardar el PDF.');
    }
});

// Ruta para listar los PDFs guardados
app.get('/listar-pdfs', (req, res) => {
    const directoryPath = path.join(__dirname, 'views', 'PDFCotizacion');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al listar los archivos.');
        }
        res.status(200).json(files); // Devolver la lista de archivos como JSON
    });
});

// Ruta para eliminar un PDF
app.delete('/PDFCotizacion/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'views', 'PDFCotizacion', fileName);
  
    // Validar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado.' });
    }
  
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al eliminar el archivo.' });
      }
      res.status(200).json({ message: 'Archivo eliminado correctamente.' });
    });
  });
  

// Usar las rutas de registro
app.use('/api/registro', rutaRegistro);
app.use('/api/almacen', almacenRoutes);

// Página principal (formulario)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
