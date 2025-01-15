// Función para obtener todos los registros y mostrar en la página
async function obtenerRegistros() {
    const response = await fetch("/api/registro/obtener");

    if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.mensaje}`);
    } else {
        const result = await response.json();
        mostrarRegistros(result.registros);
    }
}

// Función para mostrar los registros en la página
function mostrarRegistros(registros) {
    const listado = document.getElementById("listadoRegistros");

    // Limpiar el contenido previo
    listado.innerHTML = "";

    // Crear filas de la tabla con los registros
    registros.forEach(registro => {
        const fila = document.createElement("tr");

        // Crear celdas para cada campo del registro
        fila.innerHTML = `
            <td>${registro.id}</td>
            <td>${registro.clave}</td>
            <td>${registro.empresa}</td>
            <td>${registro.fecha_envio}</td>
            <td>${registro.descripcion}</td>
            <td>${registro.contacto}</td>
            <td>${registro.importe_cotizado}</td>
            <td>${registro.resultado}</td>
        `;

        // Añadir la fila al listado
        listado.appendChild(fila);
    });
}

// Función para filtrar los registros según los criterios seleccionados
function filtrarRegistros() {
    const filtroClave = document.getElementById("filtroClave").value.toLowerCase();
    const filtroEmpresa = document.getElementById("filtroEmpresa").value.toLowerCase();
    const filtroFecha = document.getElementById("filtroFecha").value.toLowerCase();
    const filtroResultado = document.getElementById("filtroResultado").value.toLowerCase();

    const filas = document.querySelectorAll("#listadoRegistros tr");

    filas.forEach(fila => {
        const columnas = fila.getElementsByTagName("td");
        const clave = columnas[1].textContent.toLowerCase();
        const empresa = columnas[2].textContent.toLowerCase();
        const fechaEnvio = columnas[3].textContent.toLowerCase();
        const resultado = columnas[7].textContent.toLowerCase();

        // Mostrar solo las filas que coincidan con al menos uno de los filtros
        if (
            clave.includes(filtroClave) &&
            empresa.includes(filtroEmpresa) &&
            fechaEnvio.includes(filtroFecha) &&
            resultado.includes(filtroResultado)
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// Función para exportar la tabla a Excel con orientación horizontal usando SheetJS
function exportarAExcel() {
    const wb = XLSX.utils.table_to_book(document.getElementById("tablaRegistros"));
    
    // Establecer la orientación horizontal de la hoja
    const ws = wb.Sheets[wb.SheetNames[0]];
    ws['!cols'] = [
        { width: 15 }, { width: 30 }, { width: 50 }, { width: 30 },
        { width: 50 }, { width: 30 }, { width: 40 }, { width: 20 }
    ]; // Definir el ancho de las columnas

    // Establecer la hoja en formato horizontal (landscape)
    const wsOpts = { bookType: "xlsx", type: "binary" };

    // Descargar el archivo Excel
    XLSX.writeFile(wb, "registros.xlsx");
}

// Función para exportar la tabla a PDF con formato horizontal en tamaño carta usando jsPDF
function exportarAPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape", "mm", "letter"); // Tamaño carta y orientación horizontal

    const tabla = document.getElementById("tablaRegistros");
    const filas = tabla.getElementsByTagName("tr");
    const columnas = tabla.getElementsByTagName("th");

    // Agregar encabezados al PDF
    let x = 10;
    let y = 10;
    const margen = 10; // Margen de la página
    const altoFila = 10; // Altura de cada fila

    // Ajustar la cabecera para que se ajuste dentro del espacio disponible
    for (let i = 0; i < columnas.length; i++) {
        doc.text(columnas[i].innerText, x + (i * 30), y);  // Espaciado para las columnas
    }
    y += altoFila;

    // Agregar filas al PDF
    for (let i = 1; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName("td");
        x = 10;
        for (let j = 0; j < celdas.length; j++) {
            doc.text(celdas[j].innerText, x + (j * 30), y); // Espaciado para las celdas
        }
        y += altoFila;
    }

    // Establecer el tamaño de la fuente y la posición para los datos
    doc.setFontSize(8);
    doc.save("registros.pdf");
}



// Llamar la función al cargar la página
document.addEventListener("DOMContentLoaded", obtenerRegistros);

// Añadir evento de filtro en cada campo de búsqueda
document.getElementById("filtroClave").addEventListener("input", filtrarRegistros);
document.getElementById("filtroEmpresa").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFecha").addEventListener("input", filtrarRegistros);
document.getElementById("filtroResultado").addEventListener("input", filtrarRegistros);
