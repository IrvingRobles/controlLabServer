<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 80c9a81 (commit retoques)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
// Función para generar la clave automáticamente con un folio continuo
function generarClave(cliente, fecha) {
    if (!cliente || !fecha) return "";

    // Extraer las iniciales del nombre del cliente
    const iniciales = cliente
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();

    // Obtener el último folio de localStorage (o iniciar en 1000 si no existe)
    let folio = parseInt(localStorage.getItem("ultimoFolio")) || 1000;

    // Incrementar el folio
    folio++;

    // Guardar el nuevo folio en localStorage para la siguiente vez
    localStorage.setItem("ultimoFolio", folio.toString());

    // Retornar la clave generada con el folio continuo
    return `${iniciales}${folio}${fecha}`;
}

// Función para convertir la fecha de YYYY-MM-DD a DDMMYYYY solo para la clave
function formatearFechaParaClave(fecha) {
    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha; // Si el formato es incorrecto, devolver la original
    return `${partes[2]}${partes[1]}${partes[0]}`; // Convertir YYYY-MM-DD a DDMMYYYY
}

// Capturar la fecha actual en formato YYYY-MM-DD para MySQL
let fechaISO;

document.addEventListener("DOMContentLoaded", function () {
    const hoy = new Date();
    fechaISO = hoy.toISOString().split("T")[0]; // YYYY-MM-DD
    document.getElementById("fechaEnvio").value = fechaISO;
});

<<<<<<< HEAD
<<<<<<< HEAD
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

<<<<<<< HEAD
=======
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
    // Obtener valores del formulario y convertirlos a mayúsculas
    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

    let cliente = getValue("cliente");
    let fechaEnvio = document.getElementById("fechaEnvio").value; // La fecha ya está en YYYY-MM-DD
    let empresa = getValue("empresa");
    let descripcion = getValue("descripcion");
    let contacto = getValue("contacto");
    let lugar = getValue("lugar");
<<<<<<< HEAD
=======
=======
>>>>>>> 80c9a81 (commit retoques)
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtener valores del formulario y convertirlos a mayúsculas
    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

<<<<<<< HEAD
    const cliente = getValue("cliente");
    const fechaEnvio = getValue("fechaEnvio");
    const empresa = getValue("empresa");
    const descripcion = getValue("descripcion"); // Cambiado de 'resultado' a 'descripcion'
    const contacto = getValue("contacto");
    const lugar = getValue("lugar");
>>>>>>> 8171355 (commit FRegistro)
=======
    let cliente = getValue("cliente");
    let fechaEnvio = document.getElementById("fechaEnvio").value; // La fecha ya está en YYYY-MM-DD
    let empresa = getValue("empresa");
    let descripcion = getValue("descripcion");
    let contacto = getValue("contacto");
    let lugar = getValue("lugar");
>>>>>>> 80c9a81 (commit retoques)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47

    // Validar los campos obligatorios
    if (!cliente || !fechaEnvio || !empresa) {
        alert("Cliente, empresa y fecha de envío son obligatorios.");
        return;
    }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
    // La clave se genera con el formato DDMMYYYY
    const claveGenerada = generarClave(cliente, formatearFechaParaClave(fechaEnvio));

    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("user"));
    const creadoPor = usuario ? usuario.username.toUpperCase() : "DESCONOCIDO";

    // Crear objeto con los datos del formulario
    const data = {
        clave: claveGenerada,
        empresa,
        fechaEnvio, // Enviar en formato YYYY-MM-DD (correcto para MySQL)
        descripcion,
        contacto,
        lugar,
        cliente,
        creadoPor
<<<<<<< HEAD
=======
=======
    // Generar la clave automáticamente
    const claveGenerada = generarClave(cliente, fechaEnvio);
=======
    // La clave se genera con el formato DDMMYYYY
    const claveGenerada = generarClave(cliente, formatearFechaParaClave(fechaEnvio));
>>>>>>> 80c9a81 (commit retoques)

>>>>>>> 8171355 (commit FRegistro)
    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("user"));
    const creadoPor = usuario ? usuario.username.toUpperCase() : "DESCONOCIDO";

    // Crear objeto con los datos del formulario
    const data = {
<<<<<<< HEAD
        clave: document.getElementById("clave").value,
        OT: document.getElementById("ordenTrabajo").value,
        empresa: document.getElementById("empresa").value,
        fechaEnvio: document.getElementById("fechaEnvio").value,
        descripcion: document.getElementById("descripcion").value,
        contacto: document.getElementById("contacto").value,
        importeCotizado: document.getElementById("importeCotizado").value,
        resultado: document.getElementById("resultado").value,
        creadoPor: creadoPor // Agregar el usuario que creó la solicitud
>>>>>>> def00b5 (commit perfiles)
=======
        clave: claveGenerada,
        empresa,
        fechaEnvio, // Enviar en formato YYYY-MM-DD (correcto para MySQL)
        descripcion,
        contacto,
        lugar,
        cliente,
        creadoPor
>>>>>>> 8171355 (commit FRegistro)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
    };

    try {
        // Enviar solicitud al servidor
        const response = await fetch("/api/registro/crear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Manejo de la respuesta del servidor
        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.mensaje}`);
        } else {
            const result = await response.json();
            alert(result.mensaje);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            // Limpiar el formulario
            document.getElementById("crearRegistroForm").reset();
            document.getElementById("fechaEnvio").value = fechaISO; // Restaurar la fecha actual
=======
            // Opcional: Redirigir o limpiar el formulario
            document.getElementById("crearRegistroForm").reset();
>>>>>>> 8171355 (commit FRegistro)
=======
            // Limpiar el formulario
            document.getElementById("crearRegistroForm").reset();
            document.getElementById("fechaEnvio").value = fechaISO; // Restaurar la fecha actual
>>>>>>> 80c9a81 (commit retoques)
=======
            // Limpiar el formulario
            document.getElementById("crearRegistroForm").reset();
            document.getElementById("fechaEnvio").value = fechaISO; // Restaurar la fecha actual
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
        }
    } catch (error) {
        alert("Error de red o del servidor.");
        console.error(error);
    }
});
