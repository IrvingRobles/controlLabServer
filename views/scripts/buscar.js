// Función para obtener todos los registros y mostrarlos en la tabla
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

    // Limpiar contenido previo
    listado.innerHTML = "";

    registros.forEach(registro => {
        const fila = document.createElement("tr");

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
        listado.appendChild(fila);
    });
}

// Función para filtrar los registros en la tabla
function filtrarRegistros() {
    const filtroClave = document.getElementById("filtroClave").value.toLowerCase();
    const filtroEmpresa = document.getElementById("filtroEmpresa").value.toLowerCase();
    const filtroFecha = document.getElementById("filtroFecha").value;
    const filtroResultado = document.getElementById("filtroResultado").value.toLowerCase();

    const filas = document.querySelectorAll("#listadoRegistros tr");

    filas.forEach(fila => {
        const columnas = fila.getElementsByTagName("td");
        const clave = columnas[1].textContent.toLowerCase();
        const empresa = columnas[2].textContent.toLowerCase();
        const fechaEnvio = columnas[3].textContent.toLowerCase();
        const resultado = columnas[7].textContent.toLowerCase();

        if (
            (filtroClave === "" || clave.includes(filtroClave)) &&
            (filtroEmpresa === "" || empresa.includes(filtroEmpresa)) &&
            (filtroFecha === "" || fechaEnvio.includes(filtroFecha)) &&
            (filtroResultado === "" || resultado.includes(filtroResultado))
        ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

// Función para exportar la tabla a Excel
function exportarAExcel() {
    const tabla = document.getElementById("tablaRegistros");
    const wb = XLSX.utils.table_to_book(tabla);

    const ws = wb.Sheets[wb.SheetNames[0]];
    ws['!cols'] = [
        { wpx: 100 }, { wpx: 120 }, { wpx: 200 }, { wpx: 150 },
        { wpx: 300 }, { wpx: 150 }, { wpx: 150 }, { wpx: 150 }
    ];

    XLSX.writeFile(wb, "Registros.xlsx");
}

// Función para exportar la tabla a PDF
function exportarAPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape", "mm", "letter");

    const tabla = document.getElementById("tablaRegistros");
    const encabezados = Array.from(tabla.querySelectorAll("thead th")).map(th => th.innerText);
    const datos = Array.from(tabla.querySelectorAll("tbody tr")).map(tr => 
        Array.from(tr.querySelectorAll("td")).map(td => td.innerText)
    );

    doc.setFontSize(14);
    doc.text("Listado de Registros", 14, 10);

    doc.autoTable({
        head: [encabezados],
        body: datos,
        startY: 20,
        styles: { fontSize: 8, halign: "center" },
        headStyles: { fillColor: [0, 123, 255] },
        theme: "grid"
    });

    doc.save("Registros.pdf");
}

// Llamar la función para obtener registros al cargar la página
document.addEventListener("DOMContentLoaded", obtenerRegistros);

// Añadir eventos de filtro
document.getElementById("filtroClave").addEventListener("input", filtrarRegistros);
document.getElementById("filtroEmpresa").addEventListener("input", filtrarRegistros);
document.getElementById("filtroFecha").addEventListener("input", filtrarRegistros);
document.getElementById("filtroResultado").addEventListener("input", filtrarRegistros);

// Eventos de exportación
document.getElementById("exportExcel").addEventListener("click", exportarAExcel);
document.getElementById("exportPDF").addEventListener("click", exportarAPDF);
