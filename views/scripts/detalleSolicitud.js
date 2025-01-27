document.getElementById("agregarFila").addEventListener("click", agregarFila);
document.getElementById("cargarDetalles").addEventListener("click", cargarDetalles);
document.getElementById("generarPDF").addEventListener("click", generarPDF);

function agregarFila() {
    const tabla = document.querySelector("#tablaMateriales tbody");
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${tabla.children.length + 1}</td>
        <td><input type="number" class="cantidad" value="0"></td>
        <td><input type="text" class="unidad"></td>
        <td><input type="text" class="descripcion"></td>
        <td><input type="number" class="precio" value="0.00"></td>
        <td><span class="importe">0.00</span></td>
        <td><button class="eliminarFila">Eliminar</button></td>
    `;

    // Añadir eventos para recalcular los totales cuando cambie el valor de cantidad o precio
    fila.querySelector(".cantidad").addEventListener("input", recalcularTotales);
    fila.querySelector(".precio").addEventListener("input", recalcularTotales);
    fila.querySelector(".eliminarFila").addEventListener("click", () => eliminarFila(fila));

    tabla.appendChild(fila);
    recalcularTotales();
}

function cargarDetalles() {
    const detalles = [
        { cantidad: 2, unidad: "Pieza", descripcion: "Calibración de balanza", precio: 1500 },
        { cantidad: 1, unidad: "Servicio", descripcion: "Mantenimiento preventivo", precio: 2000 },
        { cantidad: 5, unidad: "Pieza", descripcion: "Certificado de calibración", precio: 300 },
    ];

    const tabla = document.querySelector("#tablaMateriales tbody");
    tabla.innerHTML = ""; // Limpiar tabla

    detalles.forEach((detalle, index) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="number" class="cantidad" value="${detalle.cantidad}"></td>
            <td><input type="text" class="unidad" value="${detalle.unidad}"></td>
            <td><input type="text" class="descripcion" value="${detalle.descripcion}"></td>
            <td><input type="number" class="precio" value="${detalle.precio.toFixed(2)}"></td>
            <td><span class="importe">${(detalle.cantidad * detalle.precio).toFixed(2)}</span></td>
            <td><button class="eliminarFila">Eliminar</button></td>
        `;

        // Añadir eventos para recalcular los totales cuando cambien los valores
        fila.querySelector(".cantidad").addEventListener("input", recalcularTotales);
        fila.querySelector(".precio").addEventListener("input", recalcularTotales);
        fila.querySelector(".eliminarFila").addEventListener("click", () => eliminarFila(fila));

        tabla.appendChild(fila);
    });

    recalcularTotales();
}

function eliminarFila(fila) {
    const tabla = document.querySelector("#tablaMateriales tbody");
    tabla.removeChild(fila);
    actualizarNumeracion();
    recalcularTotales();
}

function actualizarNumeracion() {
    const filas = document.querySelectorAll("#tablaMateriales tbody tr");
    filas.forEach((fila, index) => {
        fila.children[0].innerText = index + 1; // Actualizar número de fila
    });
}

function recalcularTotales() {
    const filas = document.querySelectorAll("#tablaMateriales tbody tr");
    let total = 0;

    filas.forEach(fila => {
        const cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
        const precio = parseFloat(fila.querySelector(".precio").value) || 0;
        const importe = cantidad * precio;

        fila.querySelector(".importe").innerText = importe.toFixed(2);
        total += importe;
    });

    document.getElementById("total").innerText = total.toFixed(2);
}

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración de fuente y márgenes
    doc.setFont("helvetica", "normal");
    const marginLeft = 10;

    // Cargar y añadir el logo
    const logoPath = "../img/logo.jpg"; // Ruta del logo ajustada
    const img = new Image();
    img.src = logoPath;

    img.onload = function () {
        // Añadir el logo al PDF
        doc.addImage(img, "JPEG", marginLeft, 5, 30, 30);

        // Encabezado
        doc.setFontSize(12);
        doc.text("CALIBRACIONES TÉCNICAS DE MÉXICO, S.A. DE C.V.", 105, 15, { align: "center" });
        doc.setFontSize(9);
        doc.text("REG. FED. CTES.: CTM-050602-332", 105, 20, { align: "center" });
        doc.text("Servicios de mantenimiento, calibración y evaluación de equipos analíticos", 105, 25, { align: "center" });
        doc.text("Calle 18 de Marzo No. 85, Col. Obrera, C.P. 96740, Minatitlán, Ver., México.", 105, 30, { align: "center" });
        doc.text("Tel. / Fax: (01) 923 223 0870    E-mail: caltecmex@gmail.com", 105, 35, { align: "center" });

        // Línea horizontal
        doc.line(marginLeft, 40, 200, 40);

        // Información del cliente
        const cliente = document.getElementById("cliente").value || "-";
        const referencia = document.getElementById("referencia").value || "-";
        const direccion = document.getElementById("direccion").value || "-";
        const cotizacionNo = document.getElementById("cotizacionNo").value || "-";
        const fecha = document.getElementById("fecha").value || "-";
        const metodoEmbarque = document.getElementById("metodoEmbarque").value || "-";
        const personaCotizando = document.getElementById("personaCotizando").value || "-";
        const fechaExpiracion = document.getElementById("fechaExpiracion").value || "-";

        doc.setFontSize(10);
        doc.roundedRect(marginLeft, 45, 190, 20, 2, 2);
        doc.text(`Cliente: ${cliente}`, marginLeft + 5, 50);
        doc.text(`Dirección: ${direccion}`, marginLeft + 5, 55);
        doc.text(`Referencia: ${referencia}`, 130, 50);
        doc.text(`Cotización No: ${cotizacionNo}`, 130, 55);
        doc.text(`Fecha: ${fecha}`, 130, 60);
        doc.text(`Método de Embarque: ${metodoEmbarque}`, marginLeft + 5, 60);
        doc.text(`Realizó la cotización: ${personaCotizando}`, marginLeft + 5, 65);

        // Número de folio
        const folio = prompt("Por favor, ingresa el número de folio:");
        if (folio) {
            doc.setFontSize(10);
            doc.text(`Folio: ${folio}`, 180, 45, { align: "right" });
        }

        // Número de revisión
        const revision = prompt("Por favor, ingresa el número de revisión:");
        if (revision) {
            doc.setFontSize(10);
            doc.text(`Rev: ${revision}`, 180, 38, { align: "right" });
        }

        // Generar tabla de materiales y otros datos
        generarTablaMateriales(doc, marginLeft);

        // Firmas y otros datos
        const cuadroYPos = doc.internal.pageSize.height - 90;
        doc.setFontSize(8);
        doc.rect(marginLeft, cuadroYPos, 190, 40);
        doc.text("AUTORIZÓ:", marginLeft + 5, cuadroYPos + 6);
        doc.text("Ing. Héctor Manuel Rivera Domínguez", marginLeft + 5, cuadroYPos + 12);
        doc.text("Firma: ____________________________________", marginLeft + 5, cuadroYPos + 18);

        // Número de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`, 180, doc.internal.pageSize.height - 10, { align: "right" });

        // Canal de denuncias
        doc.setFontSize(7);
        const denunciaText = "CALTECMEX pone a su disposición el canal de denuncias: Correo electrónico: denuncia.caltecmex@gmail.com...";
        doc.text(denunciaText, marginLeft + 5, doc.internal.pageSize.height - 20, { maxWidth: 190 });

        // Fechas
        const fechaEmision = new Date().toLocaleDateString().replace(/\//g, "-");
        doc.setFontSize(8);
        doc.text(`Fecha de emisión: ${fechaEmision}`, 180, doc.internal.pageSize.height - 35, { align: "right" });
        doc.text(`Fecha de expiración: ${fechaExpiracion}`, 180, doc.internal.pageSize.height - 30, { align: "right" });

        // Crear Blob del PDF
        const pdfBlob = doc.output("blob");

        // Crear un objeto FormData y añadir el archivo Blob
        const formData = new FormData();
        const nombreArchivo = `cotizacion_${cliente}_${folio || "sin_folio"}_rev${revision || "0"}_${fechaEmision}.pdf`;
        formData.append("pdf", pdfBlob, nombreArchivo);
         
        doc.save(nombreArchivo);

        // Enviar al servidor
        fetch("/guardar-pdf", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    alert("PDF guardado con éxito en el servidor.");
                } else {
                    alert("Error al guardar el PDF.");
                }
            })
            .catch((error) => console.error("Error:", error));
    };

    img.onerror = function () {
        alert("Error al cargar el logo. Verifica la ruta o el archivo.");
    };
}


function generarTablaMateriales(doc, marginLeft) {
    let startY = 75;
    const cellHeight = 6;

    // Encabezados de la tabla
    doc.setFontSize(8);
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(marginLeft, startY, 180, cellHeight, 2, 2, "F"); // Redondeo de las esquinas
    doc.setDrawColor(0, 0, 0);
    doc.rect(marginLeft, startY, 180, cellHeight, "S"); // Borde de encabezado
    doc.text("PDA", marginLeft + 5, startY + 4);
    doc.text("CANT.", marginLeft + 20, startY + 4);
    doc.text("UNIDAD", marginLeft + 40, startY + 4);
    doc.text("DESCRIPCIÓN", marginLeft + 80, startY + 4);
    doc.text("PRECIO UNITARIO", marginLeft + 120, startY + 4);
    doc.text("IMPORTE TOTAL", marginLeft + 155, startY + 4);

    // Cuerpo de la tabla
    const filas = document.querySelectorAll("#tablaMateriales tbody tr");
    startY += cellHeight;

    filas.forEach((fila, index) => {
        const pda = index + 1;
        const cantidad = fila.querySelector(".cantidad").value || "0";
        const unidad = fila.querySelector(".unidad").value || "-";
        const descripcion = fila.querySelector(".descripcion").value || "-";
        const precio = parseFloat(fila.querySelector(".precio").value).toFixed(2) || "0.00";
        const importe = fila.querySelector(".importe").innerText || "0.00";

        doc.rect(marginLeft, startY, 180, cellHeight, "S"); // Borde de fila
        doc.text(pda.toString(), marginLeft + 5, startY + 4);
        doc.text(cantidad, marginLeft + 20, startY + 4);
        doc.text(unidad, marginLeft + 40, startY + 4);
        doc.text(descripcion, marginLeft + 80, startY + 4);
        doc.text(precio, marginLeft + 130, startY + 4);
        doc.text(importe, marginLeft + 160, startY + 4);

        startY += cellHeight;
    });

    // Total - celda más grande
    const total = document.getElementById("total").innerText || "0.00";
    doc.setFontSize(10);
    doc.text("Total:", marginLeft + 130, startY + 4);
    doc.rect(marginLeft + 130, startY, 50, cellHeight, "S"); // Borde más grande para el total
    doc.text(`$${total}`, marginLeft + 160, startY + 4);

    // Línea de total
    doc.rect(marginLeft, startY, 180, cellHeight, "S");
}
