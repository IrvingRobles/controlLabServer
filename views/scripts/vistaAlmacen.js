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

// Función para mostrar los registros en la tabla según la página actual
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
            <td>${registro.empresa}</td>
            <td>${registro.tipo_movimiento}</td>
            <td>${registro.fecha}</td>
            <td>${registro.pedido}</td>
            <td>${registro.producto}</td>
            <td>${registro.marca}</td>
            <td>${registro.proveedor}</td>
            <td>${registro.no_parte}</td>
            <td>${registro.no_serie}</td>
            <td>${registro.modelo}</td>
            <td>${registro.equipo}</td>
            <td>${registro.factura}</td>
            <td>${registro.moneda}</td>
            <td>${registro.inicial}</td>
            <td>${registro.precio_inicial}</td>
            <td>${registro.ctd_entradas}</td>
            <td>${registro.pu_entrada}</td>
            <td>${registro.concepto}</td>
            <td>${registro.anaquel}</td>
            <td>${registro.seccion}</td>
            <td>${registro.caja}</td>
            <td>${registro.observaciones}</td>
        `;
        listado.appendChild(fila);
    });

    // Actualizar paginación
    document.getElementById("paginaActual").textContent = `Página ${pagina}`;
    document.getElementById("btnAnterior").disabled = pagina === 1;
    document.getElementById("btnSiguiente").disabled = fin >= registrosFiltrados.length;
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
    const filtroEmpresa = document.getElementById("filtroEmpresa").value.toLowerCase();
    const filtroTipoMov = document.getElementById("filtroTipoMov").value.toLowerCase();
    const filtroFecha = document.getElementById("filtroFecha").value;

    // Filtrar los registros con base en los valores de los filtros
    registrosFiltrados = registrosAlmacen.filter(registro => {
        const idMov = registro.idAlmacen.toString().toLowerCase();
        const usuario = registro.idUsuario.toString().toLowerCase();
        const empresa = registro.empresa.toLowerCase();
        const tipoMov = registro.tipo_movimiento.toLowerCase();
        const fecha = registro.fecha.toLowerCase();

        return (
            (filtroIdMov === "" || idMov.includes(filtroIdMov)) &&
            (filtroUsuario === "" || usuario.includes(filtroUsuario)) &&
            (filtroEmpresa === "" || empresa.includes(filtroEmpresa)) &&
            (filtroTipoMov === "" || tipoMov.includes(filtroTipoMov)) &&
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
document.getElementById("filtroEmpresa").addEventListener("input", filtrarRegistros);
document.getElementById("filtroTipoMov").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFecha").addEventListener("input", filtrarRegistros);