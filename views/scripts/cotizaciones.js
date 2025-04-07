let datosCargados = false; // 🔥 Variable de control para evitar duplicados 
document.addEventListener('DOMContentLoaded', async () => {
    if (window.datosCargados) return; // 🔥 Evita ejecución repetida

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

        const { ordenTrabajo, cotizaciones, materiales } = data;

        function formatDate(isoDate) {
            if (!isoDate) return ''; // Si la fecha es nula, retorna vacío
            const date = new Date(isoDate);
            return isNaN(date) ? '' : date.toISOString().split('T')[0];
        }

        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value ?? ''; // Si no existe, evita errores
        };

        // 🟢 Asignación de valores a los campos del formulario
        setValue('cliente', ordenTrabajo.nombre_cliente); // Ahora sí obtiene el nombre del cliente
        setValue('referencia', cotizaciones.length > 0 ? cotizaciones[0].referencia : '');
        setValue('direccion', ordenTrabajo.lugar);
        setValue('cotizacionNo', cotizaciones.length > 0 ? cotizaciones[0].num_cotizacion : '');
        setValue('fecha', formatDate(ordenTrabajo.fecha_envio));
        setValue('fechaExpiracion', cotizaciones.length > 0 ? formatDate(cotizaciones[0].fecha_expiracion) : '');
        setValue('metodoEmbarque', cotizaciones.length > 0 ? cotizaciones[0].metodo_embarque : '');
        setValue('empleado_asignado', ordenTrabajo.empleado_asignado);

        // 🟢 Llenar la tabla con los materiales obtenidos
        rellenarTablaMateriales(materiales);

        window.datosCargados = true; // 🔥 Marcar que ya se cargaron los datos

    } catch (error) {
        console.error("❌ Error:", error);
        alert('⚠️ Hubo un error al cargar los datos');
    }

    // Asociar el evento click al botón para agregar filas
    const btnAgregarFila = document.getElementById('btnAgregarFila');
    if (btnAgregarFila) {
        btnAgregarFila.addEventListener('click', () => {
            agregarFila(); // Llama a la función para agregar una fila vacía
        });
    }
});


function rellenarTablaMateriales(materiales) {
    const tablaMateriales = document.getElementById('tablaMateriales').getElementsByTagName('tbody')[0];

    // 💡 Limpia la tabla completamente antes de agregar nuevas filas
    while (tablaMateriales.firstChild) {
        tablaMateriales.removeChild(tablaMateriales.firstChild);
    }

    if (!materiales || materiales.length === 0) return;

    materiales.forEach(material => {
        agregarFila(material.id, material.pda, material.cantidad, material.unidad, material.descripcion, material.precio_unitario, material.importe_total);
    });

    recalcularTotales(); // Recalcular los totales al cargar los datos
}

function agregarFila(id = '', pda = '', cantidad = '', unidad = '', descripcion = '', precio_unitario = '', importe_total = '') {
    const tablaMateriales = document.getElementById('tablaMateriales').getElementsByTagName('tbody')[0];

    // 💡 Evita agregar filas duplicadas verificando por PDA
    const existe = Array.from(tablaMateriales.rows).some(row => row.cells[0].querySelector('input').value === pda);
    if (existe) return;

    const row = tablaMateriales.insertRow();
    row.innerHTML = `
        <td><input type="text" value="${pda}" class="form-control"></td>
        <td><input type="number" value="${cantidad}" class="form-control cantidad" onchange="recalcularFila(this)"></td>
        <td><input type="text" value="${unidad}" class="form-control"></td>
        <td><input type="text" value="${descripcion}" class="form-control"></td>
        <td><input type="number" value="${precio_unitario}" class="form-control precio_unitario" step="0.01" onchange="recalcularFila(this)"></td>
        <td><input type="number" value="${importe_total}" class="form-control importe_total" readonly></td>
        <td><button type="button" class="btn btn-danger" onclick="eliminarFila(this, '${id}')">Eliminar</button></td>
    `;
}

async function eliminarFila(button, id) {
    if (!id || id === 'undefined' || id === 'null') {
        console.warn('Intentando eliminar un material sin ID válido.');
        const row = button.closest('tr');
        row.remove();
        recalcularTotales();
        return;
    }

    try {
        const response = await fetch(`/api/registro/material/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error(`Error al eliminar el material (ID: ${id})`);

        const row = button.closest('tr');
        row.remove();
        recalcularTotales(); // Recalcular totales después de eliminar una fila
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
    recalcularTotales(); // Recalcular los totales generales
}

function recalcularTotales() {
    const filas = document.querySelectorAll('#tablaMateriales tbody tr');
    let total = 0;

    filas.forEach(row => {
        const importe_total = parseFloat(row.querySelector('.importe_total').value) || 0;
        total += importe_total;
    });

    document.getElementById('totalGeneral').textContent = total.toFixed(2); // Mostrar el total general
}

async function guardarCotizacion() {
    const urlParams = new URLSearchParams(window.location.search);
    const id_ot = urlParams.get('id');

    if (!id_ot) {
        alert('No se ha proporcionado un ID de orden de trabajo.');
        return;
    }

    const referencia = document.getElementById('referencia').value;
    const num_cotizacion = document.getElementById('cotizacionNo').value;
    const fecha_expiracion = document.getElementById('fechaExpiracion').value;
    const metodo_embarque = document.getElementById('metodoEmbarque').value;
    const realizado_por = document.getElementById('empleado_asignado').value;

    const materiales = [];
    let totalImporteCotizado = 0; // 🔥 Inicializamos la variable para el total

    const pdaSet = new Set(); // 🔥 Para evitar duplicados

    const filas = document.querySelectorAll('#tablaMateriales tbody tr');
    filas.forEach(row => {
        const pda = row.cells[0].querySelector('input').value.trim();
        const cantidad = parseInt(row.cells[1].querySelector('input').value) || 0;
        const unidad = row.cells[2].querySelector('input').value.trim();
        const descripcion = row.cells[3].querySelector('input').value.trim();
        const precio_unitario = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const importe_total = parseFloat(row.cells[5].querySelector('input').value) || 0;

        if (!pda || pdaSet.has(pda)) return; // 🔥 Si ya existe, lo ignora
        pdaSet.add(pda); // 🔥 Agregar al Set para evitar futuros duplicados

        materiales.push({ pda, cantidad, unidad, descripcion, precio_unitario, importe_total });
        totalImporteCotizado += importe_total; // 🔥 Sumar al total de importe_cotizado
    });

    if (materiales.length === 0) {
        alert('No hay materiales válidos para guardar.');
        return;
    }

    const datosCotizacion = { 
        id_ot, 
        referencia, 
        num_cotizacion, 
        fecha_expiracion, 
        metodo_embarque, 
        realizado_por, 
        materiales,
        importe_cotizado: totalImporteCotizado // 🔥 Incluir el total calculado
    };

    try {
        const response = await fetch('/api/registro/cotizacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCotizacion)
        });

        if (response.ok) alert('Cotización y materiales guardados exitosamente');
        else throw new Error('Error al guardar la cotización');
    } catch (error) {
        console.error(error);
        alert('Hubo un error al guardar la cotización');
    }
}

document.getElementById("generarPDF").addEventListener("click", generarPDF);

async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const marginLeft = 10;

    // Configuración de fuente y márgenes
    doc.setFont("helvetica", "normal");

    // Cargar el logo como DataURL para evitar problemas de carga
    const logoPath = "../img/logo.jpg";
    try {
        const response = await fetch(logoPath);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = function (event) {
            const logoDataURL = event.target.result;
            doc.addImage(logoDataURL, "JPEG", marginLeft, 5, 30, 30);

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
            const empleado_asignado = document.getElementById("empleado_asignado").value || "-";
            const fechaExpiracion = document.getElementById("fechaExpiracion").value || "-";
            const totalImporteCotizado = document.getElementById("totalGeneral").textContent || "0.00";

            doc.setFontSize(10);
            doc.roundedRect(marginLeft, 45, 190, 25, 2, 2);
            doc.text(`Cliente: ${cliente}`, marginLeft + 5, 50);
            doc.text(`Dirección: ${direccion}`, marginLeft + 5, 55);
            doc.text(`Referencia: ${referencia}`, 130, 50);
            doc.text(`Cotización No: ${cotizacionNo}`, 130, 55);
            doc.text(`Fecha: ${convertirFecha(fecha)}`, 130, 60);
            doc.text(`Método de Embarque: ${metodoEmbarque}`, marginLeft + 5, 60);
            doc.text(`Realizó la cotización: ${empleado_asignado}`, marginLeft + 5, 65);
            doc.text(`Total: $${totalImporteCotizado}`, 130, 65);

            // Número de folio continuo
            let folio = localStorage.getItem("folioActual");
            if (!folio) {
                folio = 1; // Valor inicial si no hay folios previos
            } else {
                folio = parseInt(folio, 10) + 1; // Incrementar el folio
            }
            localStorage.setItem("folioActual", folio);
            doc.text(`Folio: ${folio}`, 180, 45, { align: "right" });

            // Número de revisión fijo
            const revision = "Rev: 04";
            doc.text(revision, 180, 38, { align: "right" });

            // Generar tabla de materiales
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
            const denunciaText = "CALTECMEX pone a su disposición el canal de denuncias: Correo electrónico: denuncia.caltecmex@gmail.com. Se garantiza la confidencialidad de toda persona que proporcione información, o colabore en alguna investigación donde se presuma el incumplimiento a lo establecido a nuestras políticas y procedimientos.";
            doc.text(denunciaText, marginLeft + 5, doc.internal.pageSize.height - 20, { maxWidth: 190 });

            // Fechas en formato día/mes/año
            const fechaActual = new Date();
            const fechaEmision = convertirFecha(`${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, "0")}-${fechaActual.getDate().toString().padStart(2, "0")}`);
            doc.setFontSize(8);
            doc.text(`Fecha de emisión: ${fechaEmision}`, 180, doc.internal.pageSize.height - 35, { align: "right" });
            doc.text(`Fecha de expiración: ${convertirFecha(fechaExpiracion)}`, 180, doc.internal.pageSize.height - 30, { align: "right" });

            // Guardar y enviar PDF
            const pdfBlob = doc.output("blob");
            const formData = new FormData();
            const nombreArchivo = `cotizacion_${cliente}_${folio}_rev04_${fechaEmision.replace(/\//g, "-")}.pdf`;
            formData.append("pdf", pdfBlob, nombreArchivo);

            doc.save(nombreArchivo);

            subirPDFAlServidor(formData);
        };

        reader.readAsDataURL(blob);
    } catch (error) {
        alert("Error al cargar el logo. Verifica la ruta o el archivo.");
        console.error(error);
    }
}

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

function generarTablaMateriales(doc, marginLeft) {
    const margenSuperior = 80;
    const anchoTabla = 190;
    const altoFila = 8;
    const maxAltoPagina = doc.internal.pageSize.height - 30;
    let y = margenSuperior + 5;

    doc.setFontSize(10);
    doc.text("Materiales:", marginLeft, margenSuperior);

    const filas = document.querySelectorAll("#tablaMateriales tbody tr");

    if (filas.length === 0) {
        doc.text("No hay materiales registrados.", marginLeft, margenSuperior + 5);
        return;
    }

    // Definir encabezados y anchos
    const encabezados = ["PDA", "Cantidad", "Unidad", "Descripción", "Precio Unitario", "Importe Total"];
    const anchosColumnas = [20, 20, 20, 80, 25, 25];

    let x = marginLeft;

    // Encabezados con fondo negro
    doc.setFillColor(0, 0, 0);
    doc.setTextColor(255, 255, 255);
    doc.rect(x, y, anchoTabla, altoFila, "F");
    doc.setFontSize(9);

    encabezados.forEach((text, index) => {
        doc.text(text, x + anchosColumnas[index] / 2, y + altoFila - 3, { align: "center" });
        x += anchosColumnas[index];
    });

    doc.setTextColor(0, 0, 0);
    y += altoFila;

    let totalImporte = 0;

    filas.forEach(row => {
        let x = marginLeft;

        const getValue = (index) => {
            const input = row.cells[index]?.querySelector("input");
            return input && input.value.trim() !== "" ? input.value : "-";
        };

        let filaDatos = [
            getValue(0), 
            getValue(1), 
            getValue(2), 
            doc.splitTextToSize(getValue(3), anchosColumnas[3] - 5), // Descripción ajustada
            `$${parseFloat(getValue(4) || 0).toFixed(2)}`, 
            `$${parseFloat(getValue(5) || 0).toFixed(2)}`
        ];

        totalImporte += parseFloat(getValue(5)) || 0;

        let altoDinamico = altoFila;

        // Verificar si se necesita una nueva página
        if (y + altoDinamico > maxAltoPagina) {
            doc.addPage();
            y = 20;
        }

        filaDatos.forEach((dato, index) => {
            doc.rect(x, y, anchosColumnas[index], altoDinamico);
            if (Array.isArray(dato)) {
                dato.forEach((linea, i) => {
                    doc.text(linea, x + anchosColumnas[index] / 2, y + altoFila * (i + 1) - 3, { align: "center" });
                });
            } else {
                doc.text(dato, x + anchosColumnas[index] / 2, y + altoFila - 3, { align: "center" });
            }
            x += anchosColumnas[index];
        });

        y += altoDinamico;
    });

    // Fila del total sin línea divisoria previa
    y += altoFila;
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", marginLeft + anchoTabla - anchosColumnas[5] - anchosColumnas[4] / 2, y + altoFila - 3, { align: "center" });
    doc.text(`$${totalImporte.toFixed(2)}`, marginLeft + anchoTabla - anchosColumnas[5] / 2, y + altoFila - 3, { align: "center" });

    // Dibujar borde de la tabla
    doc.rect(marginLeft, margenSuperior + 5, anchoTabla, y - margenSuperior - 5);
}