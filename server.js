require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path'); // Para resolver las rutas de los archivos estáticos
const cors = require('cors'); // Importar cors
const multer = require('multer'); // Para manejar uploads de archivos
const fs = require('fs'); // Para manejar archivos y directorios

const rutaRegistro = require('./routes/rutaRegistro');
const rutaLogin = require('./routes/rutaLogin'); // Nueva ruta para login
const almacenRoutes = require('./routes/almacenRoutes');

const app = express();
const port = 3000;

console.log('Email configurado:', process.env.EMAIL_USER);

app.use(session({
    secret: '1234', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Pon `true` si usas HTTPS
}));

function verificarSesion(req, res, next) {
    // Permitir acceso libre a login.html y registroUsuario.html
    if (req.path === '/login.html' || req.path === '/registroUsuario.html') {
        return next();
    }

    // Si hay sesión, permitir acceso
    if (req.session.user) {
        return next();
    }

    // Si no hay sesión, redirigir a login
    res.redirect('/login.html');
}

// Proteger todas las páginas HTML excepto login y registroUsuario
app.get('/*.html', verificarSesion, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', req.path));
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});


// Configuración de CORS
const corsOptions = {
    origin: '*', // Permitir acceso desde cualquier origen. Cambia '*' por un dominio específico si es necesario.
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

const listEndpoints = require('express-list-endpoints');
console.log(listEndpoints(app));


app.use(cors(corsOptions)); // Aplicar configuración de CORS

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json()); 

// Servir archivos estáticos (CSS y JS)
app.use(express.static(path.join(__dirname, 'views'))); // Carpeta 'views' donde están HTML, CSS, JS
app.use('/api/almacen', almacenRoutes);

// Configuración de multer para guardar PDFs en la carpeta PDFCotizacion
const storageCotizacion = multer.diskStorage({
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
const uploadCotizacion = multer({ storage: storageCotizacion });

// Ruta para manejar la subida del PDF de cotización
app.post('/guardar-pdf', uploadCotizacion.single('pdf'), (req, res) => {
    if (req.file) {
        res.status(200).send('PDF de cotización guardado correctamente.');
    } else {
        res.status(500).send('Error al guardar el PDF de cotización.');
    }
});

// Ruta para listar los PDFs de cotización guardados
app.get('/listar-pdfs', (req, res) => {
    const directoryPath = path.join(__dirname, 'views', 'PDFCotizacion');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al listar los archivos de cotización.');
        }
        res.status(200).json(files); // Devolver la lista de archivos como JSON
    });
});

// Ruta para eliminar un PDF de cotización
app.delete('/PDFCotizacion/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'views', 'PDFCotizacion', fileName);
  
    // Validar si el archivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo de cotización no encontrado.' });
    }
  
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar el archivo de cotización.' });
        }
        res.status(200).json({ message: 'Archivo de cotización eliminado correctamente.' });
    });
});

// Configuración de multer para guardar PDFs en la carpeta PDFOt
const storageOt = multer.diskStorage({
    destination: (req, file, cb) => {
        const pdfPath = path.join(__dirname, 'views', 'PDFOt'); // Carpeta para los PDFs de OT
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
const uploadOt = multer({ storage: storageOt });

// Ruta para manejar la subida del PDF de OT
app.post('/guardar-pdf-ot', uploadOt.single('pdf'), (req, res) => {
    if (req.file) {
        res.status(200).send('PDF de OT guardado correctamente.');
    } else {
        res.status(500).send('Error al guardar el PDF de OT.');
    }
});

// Ruta para listar los PDFs de OT guardados
app.get('/listar-pdfs-ot', (req, res) => {
    const directoryPath = path.join(__dirname, 'views', 'PDFOt');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error al listar los archivos de OT.');
        }
        res.status(200).json(files); // Devolver la lista de archivos como JSON
    });
});

// Ruta para eliminar un PDF de OT
app.delete('/PDFOt/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'views', 'PDFOt', fileName);
  
    // Validar si el archivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo de OT no encontrado.' });
    }
  
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar el archivo de OT.' });
        }
        res.status(200).json({ message: 'Archivo de OT eliminado correctamente.' });
    });
});

app.use('/PDFCotizacion', express.static(path.join(__dirname, 'views', 'PDFCotizacion')));
app.use('/PDFOt', express.static(path.join(__dirname, 'views', 'PDFOt')));

// Usar las rutas de registro y login
app.use('/api/registro', rutaRegistro); // Rutas del registro
app.use('/api/login', rutaLogin); // Rutas del login

// Página principal (login)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Ruta activa: ${r.route.path}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});