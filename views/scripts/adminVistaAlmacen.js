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
</td>`;
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
    window.location.href = `/adminEntradaAlmacen.html?id=${idAlmacen}`;
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
    const filtroFecha = document.getElementById("filtroFecha").value.trim();

    registrosFiltrados = registrosAlmacen.filter(registro => {
        // Filtros existentes (sin cambios)
        const idAlmacen = registro.idAlmacen.toString().toLowerCase();
        const idUsuario = registro.idUsuario.toString().toLowerCase();
        const idProducto = registro.idProducto.toLowerCase();
        const factura = registro.factura.toLowerCase();
        
        // Corregimos esta condición que tenía un paréntesis mal cerrado
        if (!(
            (filtroIdMov === "" || idAlmacen.includes(filtroIdMov)) &&
            (filtroUsuario === "" || idUsuario.includes(filtroUsuario)) &&
            (filtroProducto === "" || idProducto.includes(filtroProducto)) &&
            (filtroFactura === "" || factura.includes(filtroFactura))
        )) {
            return false;
        }

        // Si no hay filtro de fecha, devolver true
        if (filtroFecha === "") return true;

        // Convertir la fecha del registro a componentes
        const fechaRegistro = new Date(registro.fecha);
        const diaRegistro = fechaRegistro.getDate();
        const mesRegistro = fechaRegistro.getMonth() + 1; // Los meses son 0-11
        const anioRegistro = fechaRegistro.getFullYear();

        // Analizar el filtro de fecha
        const partesFecha = filtroFecha.split('-');
        
        // Caso 1: Solo un número (podría ser día o mes)
        if (partesFecha.length === 1) {
            const num = parseInt(filtroFecha);
            if (isNaN(num)) return false;
            
            // Si es <= 31, asumimos que es día
            if (num <= 31) {
                return diaRegistro === num;
            }
            // Si es > 31, asumimos que es mes
            return mesRegistro === num;
        }
        
        // Caso 2: Dos números (DD-MM o MM-AAAA)
        if (partesFecha.length === 2) {
            const primeraParte = parseInt(partesFecha[0]);
            const segundaParte = parseInt(partesFecha[1]);
            if (isNaN(primeraParte) || isNaN(segundaParte)) return false;
            
            // Si la segunda parte tiene 4 dígitos, es MM-AAAA
            if (partesFecha[1].length === 4) {
                return mesRegistro === primeraParte && 
                       anioRegistro === segundaParte;
            }
            // Si no, es DD-MM
            return diaRegistro === primeraParte && 
                   mesRegistro === segundaParte;
        }
        
        // Caso 3: Tres números (DD-MM-AAAA)
        if (partesFecha.length === 3) {
            const dia = parseInt(partesFecha[0]);
            const mes = parseInt(partesFecha[1]);
            const anio = parseInt(partesFecha[2]);
            if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return false;
            
            return diaRegistro === dia &&
                   mesRegistro === mes &&
                   anioRegistro === anio;
        }
        
        return false;
    });

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