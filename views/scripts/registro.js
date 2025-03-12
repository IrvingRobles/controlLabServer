// Función para generar la clave automáticamente con un folio continuo
function generarClave(idCliente, fecha) {
    if (!idCliente || !fecha) return "";

    // Obtener el último folio de localStorage (o iniciar en 1000 si no existe)
    let folio = parseInt(localStorage.getItem("ultimoFolio")) || 1000;

    // Incrementar el folio
    folio++;

    // Guardar el nuevo folio en localStorage para la siguiente vez
    localStorage.setItem("ultimoFolio", folio.toString());

    // Retornar la clave generada con el folio continuo y el id_cliente
    return `CL-${idCliente}-${folio}-${fecha}`;
}

// Función para convertir la fecha de YYYY-MM-DD a DDMMYYYY solo para la clave
function formatearFechaParaClave(fecha) {
    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha;
    return `${partes[2]}${partes[1]}${partes[0]}`; // Convertir YYYY-MM-DD a DDMMYYYY
}

// Capturar la fecha actual en formato YYYY-MM-DD para MySQL
let fechaISO;
document.addEventListener("DOMContentLoaded", async function () {
    const hoy = new Date();
    fechaISO = hoy.toISOString().split("T")[0]; // YYYY-MM-DD
    document.getElementById("fechaEnvio").value = fechaISO;

    // Cargar clientes en el select
    await cargarClientes();
});

// Función para obtener clientes desde el backend y llenar el select
async function cargarClientes() {
    try {
        const response = await fetch("/api/registro/obtenerClientes"); // Ajusta la ruta según tu API
        const clientes = await response.json();
        
        const select = document.getElementById("clienteSelect");
        select.innerHTML = '<option value="">Seleccione un cliente</option>'; // Opción por defecto

        clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id_cliente; // Usar id_cliente
            option.textContent = cliente.nombre_cliente;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("No se pudieron cargar los clientes.");
    }
}

// Evento para manejar el envío del formulario
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

    let idCliente = document.getElementById("clienteSelect").value; // Obtener id_cliente del select
    let fechaEnvio = document.getElementById("fechaEnvio").value;
    let empresa = getValue("empresa");
    let descripcion = getValue("descripcion");
    let contacto = getValue("contacto");
    let lugar = getValue("lugar");

    // Validar los campos obligatorios
    if (!idCliente || !fechaEnvio || !empresa) {
        alert("Cliente, empresa y fecha de envío son obligatorios.");
        return;
    }

    // Generar la clave con id_cliente en lugar de iniciales
    const claveGenerada = generarClave(idCliente, formatearFechaParaClave(fechaEnvio));

    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("user"));
    const creadoPor = usuario ? usuario.username.toUpperCase() : "DESCONOCIDO";

    // Crear objeto con los datos del formulario
    const data = {
        clave: claveGenerada,
        empresa,
        fechaEnvio,
        descripcion,
        contacto,
        lugar,
        id_cliente: idCliente, // Enviar el ID del cliente en lugar del nombre
        creadoPor
    };

    try {
        const response = await fetch("/api/registro/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.mensaje}`);
        } else {
            const result = await response.json();
            alert(result.mensaje);
            document.getElementById("crearRegistroForm").reset();
            document.getElementById("fechaEnvio").value = fechaISO;
        }
    } catch (error) {
        alert("Error de red o del servidor.");
        console.error(error);
    }
});
