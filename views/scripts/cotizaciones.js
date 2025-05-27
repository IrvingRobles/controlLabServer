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
    const yInicioTabla = 95;
    const alturaDatosFinales = 30;
    const margenInferior = 10;

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
        return;
    }

    const imprimirEncabezado = () => {
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
    };
const imprimirDatosGenerales = () => {
    const x = 10, y = 42, ancho = 190;

    // Fecha de emisión actual
    const fechaActual = new Date();
    const fechaEmision = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, "0")}-${fechaActual.getDate().toString().padStart(2, "0")}`;

    // Título principal con número de formato y revisión
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("COTIZACIÓN", 105, y, { align: "center" });

    doc.setFontSize(8);
    doc.text("FORMATO: F005", 170, y + 1);
    doc.text("REV: 04", 170, y + 4);

    // Contenedor de datos
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
    doc.text("FECHA:", x + 125, y + 21);
    doc.text("FECHA DE EMISIÓN:", x + 125, y + 26); // 🔹 Nuevo campo

    doc.setFont("helvetica", "normal");
    doc.text(data.referencia, x + 165, y + 11);
    doc.text(data.cotizacionNo, x + 165, y + 16);
    doc.text(data.fecha, x + 165, y + 21);
    doc.text(fechaEmision, x + 165, y + 26); // 🔹 Valor nuevo

    // Segunda fila de datos
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
};


    const imprimirDatosFinales = (leyenda) => {
        const x = 10, y = doc.internal.pageSize.height - 15 - 24;
        doc.setFontSize(7.5);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, 190, 24, 2, 2);
        doc.line(x, y + 8, x + 190, y + 8);
        doc.line(x, y + 16, x + 190, y + 16);
        doc.line(x + 120, y, x + 120, y + 8);
        doc.setFont("helvetica", "bold");
        const condiciones = doc.splitTextToSize(`Condiciones de pago: ${data.condicionDePago}`, 110);
        doc.text(condiciones, x + 2, y + 4);
        doc.text(`${leyenda} (SIN I.V.A.):`, x + 122, y + 4);
        doc.setFont("helvetica", "normal");
        doc.text(`$${document.getElementById("totalGeneral")?.textContent || "-"}`, x + 188, y + 4, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text("Esta cotización expira el:", x + 2, y + 11);
        doc.text("AUTORIZÓ:", x + 122, y + 11);
        doc.setFont("helvetica", "normal");
        doc.text(data.fechaExpiracion, x + 50, y + 11);
        doc.text("Ing. Héctor Manuel Rivera Domínguez", x + 140, y + 11);
        doc.setFont("helvetica", "bold");
        doc.text("COTIZÓ:", x + 2, y + 19);
        doc.setFont("helvetica", "normal");
        doc.text(data.atn, x + 25, y + 19);
    };

    const imprimirPie = (pageNumber, totalPages) => {
        const pieY = doc.internal.pageSize.height;
        doc.setFontSize(7);
        const texto = "CALTECMEX pone a su disposición el canal de denuncias: denuncia.caltecmex@gmail.com. Se garantiza la confidencialidad de toda persona que proporcione información o colabore en investigaciones relacionadas con posibles incumplimientos de nuestras políticas y procedimientos.";
        const dividido = doc.splitTextToSize(texto, 190);
        doc.text(dividido, marginLeft, pieY - 10);
        doc.setFontSize(8);
        doc.text(`Página ${pageNumber} de ${totalPages}`, 200, pieY - 5, { align: "right" });
    };

    const generarTablaMateriales = () => {
        const altoFila = 8;
        const anchoColumnas = [15, 15, 20, 90, 25, 25];
        const headers = ["PDA.", "CANT.", "UNIDAD", "DESCRIPCIÓN", "PRECIO UNITARIO", "IMPORTE TOTAL"];
        const filas = document.querySelectorAll("#tablaMateriales tbody tr");
        let y = yInicioTabla;
        let totalPaginasUsadas = 1;

        const imprimirEncabezadoTabla = () => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            let x = marginLeft;
            for (let i = 0; i < headers.length; i++) {
                doc.rect(x, y, anchoColumnas[i], altoFila); // ← sin fondo
                doc.text(headers[i], x + anchoColumnas[i] / 2, y + 5, { align: "center" });
                x += anchoColumnas[i];
            }
            y += altoFila;
            doc.setFont("helvetica", "normal");
        };


        const dibujarFila = (descripcionPartes, datos, sinBordeSuperior = false, sinBordeInferior = false) => {
            let x = marginLeft;
            const alto = altoFila * descripcionPartes.length;

            for (let i = 0; i < datos.length; i++) {
                const ancho = anchoColumnas[i];

                // Configura dibujo de bordes personalizados
                const bordeSuperior = !sinBordeSuperior;
                const bordeInferior = !sinBordeInferior;

                // Dibujar los 4 lados de la celda manualmente
                if (bordeSuperior) doc.line(x, y, x + ancho, y);                    // Superior
                doc.line(x, y, x, y + alto);                                        // Izquierda
                if (bordeInferior) doc.line(x, y + alto, x + ancho, y + alto);     // Inferior
                doc.line(x + ancho, y, x + ancho, y + alto);                        // Derecha

                if (i === 3) {
                    descripcionPartes.forEach((linea, j) => {
                        doc.text(linea, x + 3, y + altoFila * (j + 1) - 2.5);
                    });
                } else {
                    doc.text(datos[i], x + ancho / 2, y + altoFila - 3, { align: "center" });
                }

                x += ancho;
            }
        };


        imprimirEncabezadoTabla();

        filas.forEach(row => {
            const getValue = (i) => {
                const cell = row.cells[i];
                if (!cell) return "-";
                const input = cell.querySelector("input");
                if (input) return input.value.trim();
                const select = cell.querySelector("select");
                if (select) return select.value.trim();
                return "-";
            };

            const datos = [
                getValue(0), getValue(1), getValue(2), getValue(3),
                `$${parseFloat(getValue(4) || 0).toFixed(2)}`,
                `$${parseFloat(getValue(5) || 0).toFixed(2)}`
            ];

            const descripcionFormateada = doc.splitTextToSize(datos[3], anchoColumnas[3] - 6);
            const espacioDisponible = doc.internal.pageSize.height - y - alturaDatosFinales - margenInferior;
            const maxLineas = Math.floor(espacioDisponible / altoFila);

            if (descripcionFormateada.length * altoFila <= espacioDisponible) {
                dibujarFila(descripcionFormateada, datos, false, false);
                y += altoFila * descripcionFormateada.length;
            } else {
                let inicio = 0;
                while (inicio < descripcionFormateada.length) {
                    const chunk = descripcionFormateada.slice(inicio, inicio + maxLineas);

                    // Verificar salto de página
                    if (y + chunk.length * altoFila > doc.internal.pageSize.height - alturaDatosFinales - margenInferior) {
                        doc.addPage();
                        totalPaginasUsadas++;
                        y = yInicioTabla;
                        imprimirEncabezado(doc, logoDataURL);
                        imprimirDatosGenerales();
                        imprimirEncabezadoTabla();
                    }

                    const esPrimeraParte = inicio === 0;
                    const esUltimaParte = inicio + maxLineas >= descripcionFormateada.length;

                    const datosParciales = esPrimeraParte
                        ? [...datos]
                        : ["", "", "", datos[3], "", ""];

                    dibujarFila(chunk, datosParciales, !esPrimeraParte, !esUltimaParte);
                    y += altoFila * chunk.length;
                    inicio += maxLineas;
                }
            }
        });
        // 🔹 Espacio antes del resumen final
        if (y + altoFila > doc.internal.pageSize.height - alturaDatosFinales - margenInferior) {
            doc.addPage();
            totalPaginasUsadas++;
            y = yInicioTabla;
            imprimirEncabezado(doc, logoDataURL);
            imprimirDatosGenerales();
            imprimirEncabezadoTabla();
        }

        // 🔹 Dibujar fila final con total
        let x = marginLeft;
        const totalTexto = "MONTO TOTAL:";
        const totalValor = document.getElementById("totalGeneral")?.textContent || "-";

        // Celdas vacías para columnas anteriores
        for (let i = 0; i < 4; i++) {
            doc.rect(x, y, anchoColumnas[i], altoFila);
            x += anchoColumnas[i];
        }

        // Celda "MONTO TOTAL:"
        doc.rect(x, y, anchoColumnas[4], altoFila);
        doc.setFont("helvetica", "bold");
        doc.text(totalTexto, x + anchoColumnas[4] / 2, y + 5, { align: "center" });
        x += anchoColumnas[4];

        // Celda total numérico + moneda
        doc.rect(x, y, anchoColumnas[5], altoFila);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.moneda} ${totalValor}`, x + anchoColumnas[5] / 2, y + 5, { align: "center" });

        y += altoFila;



        return totalPaginasUsadas;
    };

    // Generación inicial
    imprimirEncabezado();
    imprimirDatosGenerales();
    const totalPaginasUsadas = generarTablaMateriales();
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        let leyenda = "MONTO PARCIAL COTIZADO";
        if (totalPages === 1) leyenda = "MONTO TOTAL COTIZADO";
        else if (i === totalPages) leyenda = "MONTO TOTAL COTIZADO";
        imprimirDatosFinales(leyenda);
        imprimirPie(i, totalPages);
    }

    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
    const nombreArchivo = `cotizacion_${data.cliente}_${data.cotizacionNo}_rev04_${fechaStr}.pdf`.replace(/\s+/g, "_");

    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    formData.append("pdf", pdfBlob, nombreArchivo);

    doc.save(nombreArchivo);
    subirPDFAlServidor(formData);
}