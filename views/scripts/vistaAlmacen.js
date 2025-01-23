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
        mostrarRegistros(result.registros);
    } catch (error) {
        console.error("Error al obtener registros:", error);
        alert("No se pudieron cargar los registros. Intente nuevamente más tarde.");
    }
}

// Función para mostrar los registros en la tabla
function mostrarRegistros(registros) {
    const listado = document.getElementById("listadoRegistros");

    // Limpiar contenido previo
    listado.innerHTML = "";

    registros.forEach(registro => {
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
}

// Función para filtrar los registros en la tabla
function filtrarRegistros() {
    const filtroIdMov = document.getElementById("filtroIdMov").value.toLowerCase();
    const filtroUsuario = document.getElementById("filtroUsuario").value.toLowerCase();
    const filtroEmpresa = document.getElementById("filtroEmpresa").value.toLowerCase();
    const filtroTipoMov = document.getElementById("filtroTipoMov").value.toLowerCase();
    const filtroFecha = document.getElementById("filtroFecha").value;

    const filas = document.querySelectorAll("#listadoRegistros tr");

    filas.forEach(fila => {
        const columnas = fila.getElementsByTagName("td");
        const idMov = columnas[0].textContent.toLowerCase();
        const usuario = columnas[1].textContent.toLowerCase();
        const empresa = columnas[2].textContent.toLowerCase();
        const tipoMov = columnas[3].textContent.toLowerCase();
        const fecha = columnas[4].textContent.toLowerCase();

        // Aplicar filtros
        if (
            (filtroIdMov === "" || idMov.includes(filtroIdMov)) &&
            (filtroUsuario === "" || usuario.includes(filtroUsuario)) &&
            (filtroEmpresa === "" || empresa.includes(filtroEmpresa)) &&
            (filtroTipoMov === "" || tipoMov.includes(filtroTipoMov)) &&
            (filtroFecha === "" || fecha.includes(filtroFecha))
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// Llamar la función para obtener registros al cargar la página
document.addEventListener("DOMContentLoaded", obtenerRegistrosAlmacen);

// Añadir eventos de filtro
document.getElementById("filtroIdMov").addEventListener("input", filtrarRegistros);
document.getElementById("filtroUsuario").addEventListener("input", filtrarRegistros);
document.getElementById("filtroEmpresa").addEventListener("input", filtrarRegistros);
document.getElementById("filtroTipoMov").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFecha").addEventListener("input", filtrarRegistros);