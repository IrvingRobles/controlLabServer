let registrosAlmacen = []; // Array para almacenar los registros obtenidos
let registrosFiltrados = []; // Array para los registros filtrados
let paginaActual = 1;
const registrosPorPagina = 5; // Número de registros por página

// Función para obtener todos los registros y mostrarlos en la tabla
async function obtenerRegistrosAlmacen() {
    try {
        const response = await fetch("/api/almacen/obtener");

        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.mensaje || "Ocurrió un problema al obtener los registros"}`);
            return;
        }
        const result = await response.json();
        registrosAlmacen = result.registros; // Guardamos los registros en el array
        registrosFiltrados = registrosAlmacen; // Inicialmente no se filtra
        mostrarPagina(paginaActual);
    } catch (error) {
        console.error("Error al obtener registros:", error);
        alert("No se pudieron cargar los registros. Intente nuevamente más tarde.");
    }
}

// Función para formatear la fecha en formato dd/mm/yyyy
function formatearFecha(fecha) {
    const fechaObj = new Date(fecha); // Convertir la fecha en objeto Date
    const dia = String(fechaObj.getDate()).padStart(2, '0'); // Obtener el día y asegurar que tenga dos dígitos
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0'); // Obtener el mes y asegurar que tenga dos dígitos
    const anio = fechaObj.getFullYear(); // Obtener el año
    return `${dia}/${mes}/${anio}`; // Devolver la fecha en el formato dd/mm/yyyy
}

function mostrarPagina(pagina) {
    const listado = document.getElementById("listadoRegistros");
    listado.innerHTML = ""; // Limpiar contenido previo

    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = registrosFiltrados.slice(inicio, fin);

    registrosPagina.forEach(registro => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${registro.idAlmacen}</td>
            <td>${registro.idUsuario}</td>
            <td>${registro.idMovimiento}</td>
            <td>${formatearFecha(registro.fecha)}</td>
            <td>${registro.idProducto}</td>
            <td>${registro.factura}</td>
            <td>${registro.inicial}</td>
            <td>${registro.anaquel}</td>
            <td>${registro.seccion}</td>
            <td>${registro.caja}</td>
<td>
    <button class="btn btn-secondary btn-sm fw-bold shadow-sm px-3" onclick="verMasDetalles(${registro.idAlmacen})">
        <i class="bi bi-eye"></i> Ver Más
    </button>
</td>


        `;
        listado.appendChild(fila);
    });

    // Actualizar paginación
    document.getElementById("paginaActual").textContent = `Página ${pagina}`;
    document.getElementById("btnAnterior").disabled = pagina === 1;
    document.getElementById("btnSiguiente").disabled = fin >= registrosFiltrados.length;
}

// Función para redirigir a entradaAlmacen con el id
function verMasDetalles(idAlmacen) {
    // Redirigir a la página de entradaAlmacen y pasar el id como parámetro en la URL
    window.location.href = `/entradaAlmacen.html?id=${idAlmacen}`;
}

// Eventos de los botones de paginación
document.getElementById("btnAnterior").addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina(paginaActual);
    }
});

document.getElementById("btnSiguiente").addEventListener("click", () => {
    if ((paginaActual * registrosPorPagina) < registrosFiltrados.length) {
        paginaActual++;
        mostrarPagina(paginaActual);
    }
});

// Llamar la función para obtener registros al cargar la página
document.addEventListener("DOMContentLoaded", obtenerRegistrosAlmacen);

// Función para filtrar los registros en la tabla
function filtrarRegistros() {
    const filtroIdMov = document.getElementById("filtroIdMov").value.toLowerCase();
    const filtroUsuario = document.getElementById("filtroUsuario").value.toLowerCase();
    const filtroProducto = document.getElementById("filtroProducto").value.toLowerCase();
    const filtroFactura = document.getElementById("filtroFactura").value.toLowerCase();
    const filtroFecha = document.getElementById("filtroFecha").value;

    // Filtrar los registros con base en los valores de los filtros
    registrosFiltrados = registrosAlmacen.filter(registro => {
        const idAlmacen = registro.idAlmacen.toString().toLowerCase();
        const idUsuario = registro.idUsuario.toString().toLowerCase();
        const idProducto = registro.idProducto.toLowerCase();
        const factura = registro.factura.toLowerCase();
        const fecha = registro.fecha.toLowerCase();

        return (
            (filtroIdMov === "" || idAlmacen.includes(filtroIdMov)) &&
            (filtroUsuario === "" || idUsuario.includes(filtroUsuario)) &&
            (filtroProducto === "" || idProducto.includes(filtroProducto)) &&
            (filtroFactura === "" || factura.includes(filtroFactura)) &&
            (filtroFecha === "" || fecha.includes(filtroFecha))
        );
    });

    // Volver a mostrar la primera página con los registros filtrados
    paginaActual = 1;
    mostrarPagina(paginaActual);
}

// Llamar la función para obtener registros al cargar la página
document.addEventListener("DOMContentLoaded", obtenerRegistrosAlmacen);

// Añadir eventos de filtro
document.getElementById("filtroIdMov").addEventListener("input", filtrarRegistros);
document.getElementById("filtroUsuario").addEventListener("input", filtrarRegistros);
document.getElementById("filtroProducto").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFactura").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFecha").addEventListener("input", filtrarRegistros); 