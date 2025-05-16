let datosCargados = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (datosCargados) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('❌ No se ha proporcionado un ID.');
        return;
    }

    try {
        const response = await fetch(`/api/registro/otc/${id}`);
        if (!response.ok) throw new Error('⚠️ Error al obtener los datos');

        const data = await response.json();
        console.log("🚀 Datos recibidos:", data);

        const { ordenTrabajo, cotizaciones, materiales, nuevoNumeroCotizacion } = data;

        function formatDate(isoDate) {
            if (!isoDate) return '';
            const date = new Date(isoDate);
            return isNaN(date) ? '' : date.toISOString().split('T')[0];
        }

        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value ?? '';
        };

        // 🟢 Asignar datos
        setValue('cliente', ordenTrabajo.nombre_cliente);
        setValue('referencia', cotizaciones.length > 0 ? cotizaciones[0].referencia : '');
        setValue('direccion', ordenTrabajo.lugar);
        setValue('cotizacionNo', cotizaciones.length > 0 ? cotizaciones[0].num_cotizacion : nuevoNumeroCotizacion);
        setValue('fecha', formatDate(ordenTrabajo.fecha_envio));
        setValue('fechaExpiracion', cotizaciones.length > 0 ? formatDate(cotizaciones[0].fecha_expiracion) : '');
        setValue('metodoEmbarque', cotizaciones.length > 0 ? cotizaciones[0].metodo_embarque : '');
        setValue('empleado_asignado', ordenTrabajo.empleado_asignado);
        setValue('moneda', cotizaciones.length > 0 ? cotizaciones[0].moneda : '');
        setValue('observaciones', cotizaciones.length > 0 ? cotizaciones[0].observaciones : '');
        setValue('condicionDePago', cotizaciones.length > 0 ? cotizaciones[0].condicion_de_pago : '');
        setValue('tiempoEntrega', cotizaciones.length > 0 ? cotizaciones[0].tiempo_entrega : '');


        // 🟢 Guardar id de cotización en campo oculto
        const idCotizacion = cotizaciones.length > 0 ? cotizaciones[0].id : '';
        document.getElementById('idCotizacion').value = idCotizacion;

        // 🟢 Cargar materiales
        rellenarTablaMateriales(materiales);

        datosCargados = true;

    } catch (error) {
        console.error("❌ Error:", error);
        alert('⚠️ Hubo un error al cargar los datos');
    }

    // 🟢 Botón para agregar fila
    const btnAgregarFila = document.getElementById('btnAgregarFila');
    if (btnAgregarFila) {
        btnAgregarFila.addEventListener('click', () => {
            agregarFila();
        });
    }
});

function rellenarTablaMateriales(materiales) {
    const tablaMateriales = document.getElementById('tablaMateriales').getElementsByTagName('tbody')[0];

    while (tablaMateriales.firstChild) {
        tablaMateriales.removeChild(tablaMateriales.firstChild);
    }

    if (!materiales || materiales.length === 0) return;

    materiales.forEach(material => {
        agregarFila(material.id, material.pda, material.cantidad, material.unidad, material.descripcion, material.precio_unitario, material.importe_total);
    });

    recalcularTotales();
}

function agregarFila(id = '', pda = '', cantidad = '', unidad = '', descripcion = '', precio_unitario = '', importe_total = '') {
    const tablaMateriales = document.getElementById('tablaMateriales').getElementsByTagName('tbody')[0];

    if (!pda) {
        const pdasExistentes = Array.from(tablaMateriales.rows).map(row => {
            const inputPda = row.cells[0].querySelector('input');
            return inputPda ? parseInt(inputPda.value.trim(), 10) : NaN;
        }).filter(n => !isNaN(n));

        const maxPda = pdasExistentes.length > 0 ? Math.max(...pdasExistentes) : 0;
        const nuevoPda = String(maxPda + 1).padStart(2, '0');
        pda = nuevoPda;
    }

    const existe = Array.from(tablaMateriales.rows).some(row => row.cells[0].querySelector('input').value === pda);
    if (existe) return;

    const row = tablaMateriales.insertRow();
    row.innerHTML = `
        <td><input type="text" value="${pda}" class="form-control" readonly></td>
        <td><input type="number" value="${cantidad}" class="form-control cantidad" onchange="recalcularFila(this)"></td>
        <td>
            <select class="form-control">
                <option value="unidad" ${unidad === 'unidad' ? 'selected' : ''}>unidad</option>
                <option value="servicio" ${unidad === 'servicio' ? 'selected' : ''}>servicio</option>
                <option value="pieza" ${unidad === 'pieza' ? 'selected' : ''}>pieza</option>
                <option value="lote" ${unidad === 'lote' ? 'selected' : ''}>lote</option>
            </select>
        </td>
        <td><input type="text" value="${descripcion}" class="form-control"></td>
        <td><input type="number" value="${precio_unitario}" class="form-control precio_unitario" step="0.01" onchange="recalcularFila(this)"></td>
        <td><input type="number" value="${importe_total}" class="form-control importe_total" readonly></td>
        <td><button type="button" class="btn btn-danger" onclick="eliminarFila(this, '${id}')">Eliminar</button></td>
    `;
}

async function eliminarFila(button, id) {
    if (!id || id === 'undefined' || id === 'null') {
        const row = button.closest('tr');
        row.remove();
        recalcularTotales();
        return;
    }

    try {
        const response = await fetch(`/api/registro/material/${id}`, { method: 'DELETE' });

        if (!response.ok) throw new Error(`Error al eliminar el material (ID: ${id})`);

        const row = button.closest('tr');
        row.remove();
        recalcularTotales();
    } catch (error) {
        console.error(error);
        alert(`Hubo un error al eliminar el material: ${error.message}`);
    }
}

function recalcularFila(input) {
    const row = input.closest('tr');
    const cantidad = parseFloat(row.querySelector('.cantidad').value) || 0;
    const precio_unitario = parseFloat(row.querySelector('.precio_unitario').value) || 0;
    const importe_total = cantidad * precio_unitario;

    row.querySelector('.importe_total').value = importe_total.toFixed(2);
    recalcularTotales();
}

function recalcularTotales() {
    const filas = document.querySelectorAll('#tablaMateriales tbody tr');
    let total = 0;

    filas.forEach(row => {
        const importe_total = parseFloat(row.querySelector('.importe_total').value) || 0;
        total += importe_total;
    });

    document.getElementById('totalGeneral').textContent = total.toFixed(2);
}

async function guardarCotizacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const id_ot = urlParams.get('id');

    if (!id_ot) {
        alert('No se ha proporcionado un ID de orden de trabajo.');
        return;
    }

    const id = document.getElementById('idCotizacion').value || null;
    const referencia = document.getElementById('referencia').value;
    const num_cotizacion = document.getElementById('cotizacionNo').value;
    const fecha_expiracion = document.getElementById('fechaExpiracion').value;
    const metodo_embarque = document.getElementById('metodoEmbarque').value;
    const realizado_por = document.getElementById('empleado_asignado').value;
    const moneda = document.getElementById('moneda').value;
    const observaciones = document.getElementById('observaciones').value;

    // 🔥 Nuevos campos
    const condicion_de_pago = document.getElementById('condicionDePago').value;
    const tiempo_entrega = document.getElementById('tiempoEntrega').value;

    const materiales = [];
    let totalImporteCotizado = 0;
    const pdaSet = new Set();

    const filas = document.querySelectorAll('#tablaMateriales tbody tr');
    filas.forEach(row => {
        const pda = row.cells[0].querySelector('input').value.trim();
        const cantidad = parseInt(row.cells[1].querySelector('input').value) || 0;
        const unidad = row.cells[2].querySelector('select').value.trim();
        const descripcion = row.cells[3].querySelector('input').value.trim();
        const precio_unitario = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const importe_total = parseFloat(row.cells[5].querySelector('input').value) || 0;

        if (!pda || pdaSet.has(pda)) return;
        pdaSet.add(pda);

        materiales.push({ pda, cantidad, unidad, descripcion, precio_unitario, importe_total });
        totalImporteCotizado += importe_total;
    });

    if (materiales.length === 0) {
        alert('No hay materiales válidos para guardar.');
        return;
    }

    const datosCotizacion = {
        id,
        id_ot,
        referencia,
        num_cotizacion,
        fecha_expiracion,
        metodo_embarque,
        realizado_por,
        moneda,
        observaciones,
        condicion_de_pago, // ✅ Nuevo campo
        tiempo_entrega,     // ✅ Nuevo campo
        materiales,
        importe_cotizado: totalImporteCotizado
    };

    try {
        const response = await fetch('/api/registro/cotizacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCotizacion)
        });

        if (response.ok) {
            alert('Cotización y materiales guardados exitosamente');
            location.reload(); // Opcional: recargar para actualizar datos
        } else {
            throw new Error('Error al guardar la cotización');
        }
    } catch (error) {
        console.error(error);
        alert('Hubo un error al guardar la cotización');
    }
}



document.getElementById("generarPDF").addEventListener("click", generarPDF);

// Función para convertir fechas al formato día/mes/año
function convertirFecha(fechaISO) {
    const [year, month, day] = fechaISO.split("-");
    return `${day}/${month}/${year}`;
}

async function subirPDFAlServidor(formData) {
    try {
        const response = await fetch("/guardar-pdf", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("PDF guardado con éxito en el servidor.");
        } else {
            alert("Error al guardar el PDF.");
        }
    } catch (error) {
        console.error("Error al subir el PDF:", error);
        alert("Hubo un error al subir el PDF.");
    }
}

async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const marginLeft = 10;

    const data = {
        cliente: document.getElementById("cliente").value || "-",
        direccion: document.getElementById("direccion").value || "-",
        atn: document.getElementById("empleado_asignado").value || "-",
        referencia: document.getElementById("referencia").value || "-",
        cotizacionNo: document.getElementById("cotizacionNo").value || "-",
        fecha: document.getElementById("fecha").value || "-",
        fechaExpiracion: document.getElementById("fechaExpiracion").value || "-",
        metodoEmbarque: document.getElementById("metodoEmbarque").value || "-",
        moneda: document.getElementById("moneda").value || "M.N.",
        observaciones: document.getElementById("observaciones").value || "-",
        tiempoEntrega: document.getElementById("tiempoEntrega").value || "-",
        condicionDePago: document.getElementById("condicionDePago").value || "-"
    };


    let logoDataURL = null;
    try {
        const response = await fetch("../img/logo.jpg");
        const blob = await response.blob();
        logoDataURL = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        alert("Error al cargar el logo.");
        console.error(error);
        return;
    }

    function imprimirEncabezado(doc, logoDataURL) {
        if (logoDataURL) {
            doc.addImage(logoDataURL, "PNG", marginLeft, 5, 30, 30);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("CALIBRACIONES TÉCNICAS DE MÉXICO, S.A. DE C.V.", 105, 13, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("REG. FED. CTES.: CTM-050602-332", 105, 18, { align: "center" });
        doc.text("Servicios de mantenimiento, calibración y evaluación de equipos analíticos", 105, 23, { align: "center" });
        doc.text("Calle 18 de Marzo No. 85, Col. Obrera, C.P. 96740, Minatitlán, Ver., México.", 105, 28, { align: "center" });
        doc.text("Tel. / Fax:  923 223 0870    E-mail: caltecmex@gmail.com", 105, 33, { align: "center" });

        doc.line(marginLeft, 38, 200, 38);
    }

    function imprimirPie(doc, pageNumber, pageCount) {
        const pieY = doc.internal.pageSize.height;
        doc.setFontSize(7);
        const textoDenuncia = "CALTECMEX pone a su disposición el canal de denuncias: Correo electrónico: denuncia.caltecmex@gmail.com. " +
            "Se garantiza la confidencialidad de toda persona que proporcione información, o colabore en alguna investigación " +
            "donde se presuma el incumplimiento a lo establecido a nuestras políticas y procedimientos.";
        const textoDividido = doc.splitTextToSize(textoDenuncia, 190);
        doc.text(textoDividido, marginLeft, pieY - 15);
        doc.setFontSize(8);
        doc.text(`Página ${pageNumber} de ${pageCount}`, 200, pieY - 5, { align: "right" });
    }

    function imprimirDatosGenerales(doc, data) {
        const x = 10;
        const y = 42;
        const ancho = 190;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("COTIZACIÓN", 105, y, { align: "center" });

        doc.setLineWidth(0.3);
        doc.roundedRect(x, y + 5, ancho, 30, 2, 2);

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("CLIENTE:", x + 3, y + 11);
        doc.text("DIRECCIÓN:", x + 3, y + 16);
        doc.text("ATN:", x + 3, y + 21);

        doc.setFont("helvetica", "normal");
        doc.text(data.cliente, x + 28, y + 11);
        doc.text(data.direccion, x + 28, y + 16);
        doc.text(data.atn, x + 28, y + 21);

        doc.setFont("helvetica", "bold");
        doc.text("REFERENCIA:", x + 125, y + 11);
        doc.text("COTIZACIÓN No:", x + 125, y + 16);

        doc.setFont("helvetica", "normal");
        doc.text(data.referencia, x + 165, y + 11);
        doc.text(data.cotizacionNo, x + 165, y + 16);

        doc.setFont("helvetica", "bold");
        doc.text("FECHA:", x + 125, y + 21);
        doc.setFont("helvetica", "normal");
        doc.text(data.fecha, x + 165, y + 21);

        doc.setFont("helvetica", "bold");
        doc.rect(x, y + 36, ancho, 10);
        doc.line(x + 63, y + 36, x + 63, y + 46);
        doc.line(x + 126, y + 36, x + 126, y + 46);

        doc.text("TIEMPO DE ENTREGA", x + 5, y + 41);
        doc.text("MÉTODO DE EMBARQUE", x + 65, y + 41);
        doc.text("PRECIOS EN:", x + 128, y + 41);

        doc.setFont("helvetica", "normal");
        doc.text(data.tiempoEntrega, x + 5, y + 44);
        doc.text(data.metodoEmbarque, x + 65, y + 44);
        doc.text(data.moneda, x + 128, y + 44);
    }

    function generarTablaMateriales(doc, yInicial) {
        const altoFila = 8;
        const margenIzquierdo = 10;
        const anchoColumnas = [15, 15, 20, 90, 25, 25];
        const headers = ["PDA.", "CANT.", "UNIDAD", "DESCRIPCIÓN", "PRECIO UNITARIO", "IMPORTE TOTAL"];
        let y = yInicial;

        const maxY = doc.internal.pageSize.height - 35; // espacio para el pie

        const imprimirEncabezadoTabla = () => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7); // encabezado más pequeño
            let x = margenIzquierdo;
            for (let i = 0; i < headers.length; i++) {
                doc.rect(x, y, anchoColumnas[i], altoFila);
                doc.text(headers[i], x + anchoColumnas[i] / 2, y + 6, { align: "center" }); // centrado vertical ajustado
                x += anchoColumnas[i];
            }
            y += altoFila;

            doc.setFont("helvetica", "normal"); // ¡Volver a normal después del encabezado!
        };

        imprimirEncabezadoTabla();

        const filas = document.querySelectorAll("#tablaMateriales tbody tr");

        filas.forEach(row => {
            let x = margenIzquierdo;

            const getValue = (index) => {
                const cell = row.cells[index];
                if (!cell) return "-";
                const input = cell.querySelector("input");
                if (input) return input.value.trim();
                const select = cell.querySelector("select");
                if (select) return select.value.trim();
                return "-";
            };

            const datos = [
                getValue(0),
                getValue(1),
                getValue(2),
                getValue(3),
                `$${parseFloat(getValue(4) || 0).toFixed(2)}`,
                `$${parseFloat(getValue(5) || 0).toFixed(2)}`
            ];

            const descripcionFormateada = doc.splitTextToSize(datos[3], anchoColumnas[3] - 6); // ← margen más seguro
            const altoDinamico = altoFila * descripcionFormateada.length;

            // 👉 SALTO DE PÁGINA si no cabe
            if (y + altoDinamico > maxY) {
                doc.addPage();
                imprimirEncabezado(doc, logoDataURL); // encabezado general
                y = 45;
                imprimirEncabezadoTabla(); // solo encabezado de tabla
            }

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7); // texto de contenido un poco más pequeño

            x = margenIzquierdo;
            for (let i = 0; i < datos.length; i++) {
                const ancho = anchoColumnas[i];
                doc.rect(x, y, ancho, altoDinamico);

                if (i === 3) {
                    descripcionFormateada.forEach((linea, j) => {
                        doc.text(linea, x + 2, y + altoFila * (j + 1) - 3, { align: "left" });
                    });
                } else {
                    doc.text(datos[i], x + ancho / 2, y + altoFila - 3, { align: "center" });
                }

                x += ancho;
            }

            y += altoDinamico;
        });

        return y;
    }

    function imprimirDatosFinales(doc, y, data) {
        const x = 10;
        const ancho = 190;
        const altoFila = 6;

        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, ancho, altoFila * 3 + 6, 2, 2);

        // Líneas horizontales
        doc.line(x, y + altoFila + 2, x + ancho, y + altoFila + 2);
        doc.line(x, y + altoFila * 2 + 4, x + ancho, y + altoFila * 2 + 4);

        // Línea vertical para monto
        doc.line(x + 120, y, x + 120, y + altoFila + 2);

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        const condicionesPago = doc.splitTextToSize(`Condiciones de pago: ${data.condicionDePago || '-'}`, 110);
        doc.text(condicionesPago, x + 2, y + 4);

        doc.text("MONTO PARCIAL COTIZADO (SIN I.V.A.):", x + 122, y + 4);

        doc.setFont("helvetica", "normal");
        doc.text(`$${document.getElementById("totalGeneral")?.textContent || "-"}`, x + 188, y + 4, { align: "right" });

        // Segunda fila
        doc.setFont("helvetica", "bold");
        doc.text("Esta cotización expira el:", x + 2, y + altoFila + 7);
        doc.text("AUTORIZÓ:", x + 122, y + altoFila + 7);

        doc.setFont("helvetica", "normal");
        doc.text(data.fechaExpiracion, x + 50, y + altoFila + 7);
        doc.text("Ing. Héctor Manuel Rivera Domínguez", x + 140, y + altoFila + 7);

        // Tercera fila
        doc.setFont("helvetica", "bold");
        doc.text("COTIZÓ:", x + 2, y + altoFila * 2 + 10);
        doc.setFont("helvetica", "normal");
        doc.text(data.atn, x + 25, y + altoFila * 2 + 10);
    }
    // 1. Primera página: encabezado + datos generales
    imprimirEncabezado(doc, logoDataURL);
    imprimirDatosGenerales(doc, data);

    // 2. Generar tabla de materiales debajo
    const yFinal = generarTablaMateriales(doc, 95);
    imprimirDatosFinales(doc, yFinal + 5, data);


    // 3. Encabezado y pie en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        imprimirEncabezado(doc, logoDataURL);
        imprimirPie(doc, i, pageCount);
    }

    // 4. Guardar y subir PDF al servidor
    const fechaActual = new Date();
    const fechaEmision = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, "0")}-${fechaActual.getDate().toString().padStart(2, "0")}`;

    const nombreArchivo = `cotizacion_${data.cliente}_${data.cotizacionNo}_rev04_${fechaEmision}.pdf`.replace(/\s+/g, "_");

    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    formData.append("pdf", pdfBlob, nombreArchivo);

    doc.save(nombreArchivo); // descarga en el navegador
    subirPDFAlServidor(formData); // envía al servidor

}

