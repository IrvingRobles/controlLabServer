document.addEventListener("DOMContentLoaded", () => {
    const tablaRegistros = document.querySelector("#tablaSolicitudes");
    const exportPDFBtn = document.getElementById("exportPDF");
    const contenedor = document.getElementById("contenedorSolicitudes");
    const filtroClaveTarjetas = document.getElementById("buscarInputTarjetas");
    const filtroClaveTabla = document.getElementById("buscarInputTabla");
    const noResults = document.getElementById("noResults");
    
    if (!contenedor || !filtroClaveTarjetas || !filtroClaveTabla) {
        console.error("Error: No se encontraron los elementos en el DOM.");
        return;
    }
    
    // Filtrar solicitudes en tarjetas
    function filtrarSolicitudesTarjetas() {
        const filtro = filtroClaveTarjetas.value.toLowerCase();
        let hayResultados = false;
    
        document.querySelectorAll(".card").forEach(card => {
            const clave = card.textContent.toLowerCase();
            const empresa = card.textContent.toLowerCase();
            const visible = clave.includes(filtro) || empresa.includes(filtro);
            card.style.display = visible ? "" : "none";
    
            if (visible) hayResultados = true;
        });
    
        noResults.style.display = hayResultados ? "none" : "block";
    }
    
    
    // Filtrar solicitudes en tabla
    function filtrarSolicitudesTabla() {
        const filtro = filtroClaveTabla.value.toLowerCase();
        let hayResultados = false;
    
        const filas = document.querySelectorAll("#tablaSolicitudes tbody tr");
        filas.forEach(fila => {
            const columnas = fila.getElementsByTagName("td");
            const clave = columnas[1] ? columnas[1].textContent.toLowerCase() : '';  // Comprobamos si existe el valor
            const empresa = columnas[3] ? columnas[3].textContent.toLowerCase() : '';  // Comprobamos si existe el valor
            const visible = clave.includes(filtro) || empresa.includes(filtro);
            fila.style.display = visible ? "" : "none";
    
            if (visible) hayResultados = true;
        });
    
        noResults.style.display = hayResultados ? "none" : "block";
    }
    
    filtroClaveTarjetas.addEventListener("input", filtrarSolicitudesTarjetas);
    filtroClaveTabla.addEventListener("input", filtrarSolicitudesTabla);
    

filtroClaveTarjetas.addEventListener("input", filtrarSolicitudesTarjetas);
filtroClaveTabla.addEventListener("input", filtrarSolicitudesTabla);

    // Obtener empleados de la API
    async function obtenerEmpleados() {
        try {
            const respuesta = await fetch("/api/registro/empleados");
            if (!respuesta.ok) throw new Error(`Error ${respuesta.status}: No se pudieron obtener los empleados`);

            const empleados = await respuesta.json();
            if (!empleados.length) alert("No hay empleados disponibles para asignar.");

            return empleados;
        } catch (error) {
            console.error("Error obteniendo empleados:", error);
            return [];
        }
    }

    // Mostrar el modal de asignación
    async function mostrarModalAsignacion(idRegistro) {
        const empleados = await obtenerEmpleados();

        let modal = document.querySelector("#modalAsignarPersonal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "modalAsignarPersonal";
            modal.classList.add("modal", "fade");
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Asignar Personal</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <label for="selectPersonal">Seleccione el personal:</label>
                            <select id="selectPersonal" class="form-control"></select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button id="btnConfirmarAsignacion" class="btn btn-primary">Asignar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const selectPersonal = modal.querySelector("#selectPersonal");
        selectPersonal.innerHTML = empleados.map(emp => `<option value="${emp.id}">${emp.nombre}</option>`).join("");

        const btnConfirmar = modal.querySelector("#btnConfirmarAsignacion");
        btnConfirmar.onclick = () => asignarPersonal(idRegistro, selectPersonal.value);

        new bootstrap.Modal(modal).show();
    }
// Asignar personal a una solicitud
async function asignarPersonal(idRegistro, idEmpleado) {
    if (!idEmpleado) {
        alert("Debe seleccionar un empleado antes de asignar.");
        return;
    }

    try {
        const respuesta = await fetch(`/api/registro/asignar/${idRegistro}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empleadoId: idEmpleado }),
        });

        if (!respuesta.ok) throw new Error("No se pudo asignar personal.");

        alert("Personal asignado correctamente.");
        cargarRegistros();

        // ✅ Cerrar automáticamente el modal después de asignar
        const modalElement = document.querySelector("#modalAsignarPersonal");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }

    } catch (error) {
        console.error("❌ Error en la asignación:", error);
        alert(`Error en la asignación: ${error.message}`);
    }
}

async function cargarRegistros() {
    try {
        const respuesta = await fetch("/api/registro/obtener");
        if (!respuesta.ok) throw new Error("Error al cargar registros");

        const data = await respuesta.json();
        const tbody = tablaRegistros.querySelector("tbody");
        const contenedor = document.getElementById("contenedorSolicitudes");

        tbody.innerHTML = "";
        contenedor.innerHTML = "";

        if (data.registros.length === 0) {
            document.getElementById("noResults").style.display = "";
            return;
        }

        data.registros.forEach((registro) => {
            // Formatear la fecha
            const fechaEnvio = new Date(registro.fecha_envio).toLocaleDateString("es-ES");

            // 📌 Agregar registros a la Tabla
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${registro.id}</td>
                <td contenteditable="true">${registro.clave}</td>
                <td>${registro.OT}</td>
                <td>${registro.empresa}</td>
                <td>${fechaEnvio}</td>
                <td contenteditable="true">${registro.descripcion}</td>
                <td>${registro.contacto}</td>
                <td>${registro.importe_cotizado}</td>
                <td contenteditable="true">${registro.resultado}</td>
                <td>${registro.empleado_asignado || "No asignado"}</td>
            `;
            tbody.appendChild(fila);

            // 📌 Agregar registros como tarjetas
            const card = document.createElement("div");
            card.className = "col-md-4 mb-3";
            card.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${registro.empresa}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">Clave: ${registro.clave} | OT: ${registro.OT}</h6>
                        <p><strong>Fecha Envío:</strong> ${fechaEnvio}</p>
                        <p><strong>Descripción:</strong> <span contenteditable="true">${registro.descripcion}</span></p>
                        <p><strong>Contacto:</strong> ${registro.contacto}</p>
                        <p><strong>Importe Cotizado:</strong> ${registro.importe_cotizado}</p>
                        <p><strong>Resultado:</strong> <span contenteditable="true">${registro.resultado}</span></p>
                        <p><strong>Personal Asignado:</strong> ${registro.empleado_asignado || "No asignado"}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-primary btn-sm btn-asignar" data-id="${registro.id}">Asignar</button>
                            <button class="btn btn-success btn-sm btn-guardar" data-id="${registro.id}">Guardar</button>
                            <button class="btn btn-danger btn-sm btn-eliminar" data-id="${registro.id}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

        // Agregar eventos a los botones
        document.querySelectorAll(".btn-asignar").forEach(boton => 
            boton.addEventListener("click", (e) => mostrarModalAsignacion(e.target.dataset.id))
        );

        document.querySelectorAll(".btn-guardar").forEach(boton => 
            boton.addEventListener("click", (e) => guardarRegistro(e.target.dataset.id, e.target.closest("tr")))
        );

        document.querySelectorAll(".btn-eliminar").forEach(boton => 
            boton.addEventListener("click", (e) => eliminarRegistro(e.target.dataset.id))
        );

    } catch (error) {
        console.error("Error al cargar registros:", error);
    }
}

    cargarRegistros();



    // Guardar cambios en un registro
    async function guardarRegistro(id, fila) {
        const datosActualizados = {
            clave: fila.children[1].textContent.trim(),
            OT: fila.children[2].textContent.trim(),
            empresa: fila.children[3].textContent.trim(),
            fechaEnvio: fila.children[4].textContent.trim(),
            descripcion: fila.children[5].textContent.trim(),
            contacto: fila.children[6].textContent.trim(),
            importeCotizado: fila.children[7].textContent.trim(),
            resultado: fila.children[8].textContent.trim(),
        };

        try {
            const respuesta = await fetch(`/api/registro/actualizar/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosActualizados),
            });

            if (!respuesta.ok) throw new Error("Error al guardar los cambios");

            alert("Registro actualizado con éxito.");
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
        }
    }
    
    async function eliminarRegistro(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;

        try {
            const respuesta = await fetch(`/api/registro/eliminar/${id}`, { method: "DELETE" });

            if (!respuesta.ok) throw new Error("Error al eliminar el registro");

            alert("Registro eliminado con éxito.");
            cargarRegistros();
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        }
    }

   
    exportPDFBtn.addEventListener("click", exportPDF);
    cargarRegistros();

    document.getElementById("exportPDF").addEventListener("click", exportPDF);
    function exportPDF() {
        const { jsPDF } = window.jspdf;

        // Solicitar número de revisión
        const revision = "03"; // Número de revisión fijo
        // const revision = prompt("Ingrese el número de revisión:", "03");
        // if (!revision) return; // Si no se ingresa un número de revisión, no exporta

        const doc = new jsPDF("landscape", "mm", "letter"); // Orientación horizontal

        // Obtener el último folio guardado en localStorage
        let folioActual = localStorage.getItem("ultimoFolio") || 1;
        folioActual = parseInt(folioActual, 10); // Convertir a número

        // Formatear folio (por ejemplo, 001, 002, etc.)
        const folioFormateado = String(folioActual).padStart(3, "0");

        // Incrementar el folio para el siguiente uso
        localStorage.setItem("ultimoFolio", folioActual + 1);

        // Cargar logo
        const logo = new Image();
        logo.src = "./img/logo.jpg"; // Ruta del logo

        logo.onload = function () {
            const addHeader = () => {
                // Encabezado con logotipo y datos
                doc.addImage(logo, "JPEG", 10, 10, 30, 20); // Logotipo
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text("CALIBRACIONES TECNICAS DE MEXICO, S.A. DE C.V.", 45, 15);
                doc.setFontSize(10);
                doc.text(
                    "SERVICIO DE MANTENIMIENTO, CALIBRACION Y EVALUACION DE EQUIPOS ANALITICOS.",
                    45,
                    20
                );
                doc.text("R.F.C.: CTM-050602-332", 45, 25);

                // Título del documento
                doc.setFontSize(14);
                doc.setTextColor(0, 153, 76); // Verde
                doc.text("Registro de Cotizaciones ~ 2024", 10, 40);

                // Folio en la esquina superior derecha
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`Folio: ${folioFormateado}`, 270, 15, { align: "right" });
            };

            const addFooter = (pageNumber) => {
                // Pie de página
                const fechaEmision = new Date().toLocaleDateString();
                doc.setFontSize(10);
                doc.text(`Emisión: ${fechaEmision}`, 10, 200); // Fecha en la esquina inferior izquierda
                doc.text(`Página ${pageNumber}`, 140, 200, { align: "center" }); // Número de página al centro
                doc.text(`Rev. ${revision}`, 270, 200, { align: "right" }); // Revisión en la esquina inferior derecha
            };

            // Construcción de la tabla
            const tabla = [];
            const filas = tablaRegistros.querySelectorAll("tr");

            filas.forEach((fila) => {
                if (fila.style.display !== "none") {
                    // Solo incluir filas visibles
                    const datosFila = Array.from(fila.children)
                        .slice(1, -1) // Omitir las columnas no deseadas
                        .map((celda) => celda.textContent.trim());
                    tabla.push(datosFila);
                }
            });

            // Configuración de la tabla
            const tableOptions = {
                startY: 50, // Posición inicial
                head: [
                    [
                        "CLAVE COTIZACION",
                        "OT",
                        "EMPRESA (CLIENTE)",
                        "FECHA DE ENVIO",
                        "DESCRIPCION",
                        "CONTACTO",
                        "IMPORTE COTIZADO",
                        "RESULTADO",
                    ],
                ],
                body: tabla,
                theme: "grid",
                headStyles: {
                    fillColor: [0, 153, 76], // Verde oscuro
                    textColor: [255, 255, 255], // Blanco
                    fontSize: 10,
                    halign: "center",
                },
                bodyStyles: {
                    fontSize: 9,
                    halign: "center",
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 50 },
                    5: { cellWidth: 30 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 30 },
                },
                didDrawPage: function (data) {
                    // Agregar encabezado en cada página
                    addHeader();
                },
                margin: { top: 50 }, // Margen superior para el encabezado
            };

            // Generar la tabla
            doc.autoTable(tableOptions);

            // Agregar el pie de página en todas las páginas
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i); // Cambiar a la página actual
                addFooter(i);
            }

            // Guardar el documento
            doc.save(`Tabla_Registro_Folio_${folioFormateado}.pdf`);
        };

        logo.onerror = function () {
            alert("Error al cargar el logo. Verifique la ruta y el formato del archivo.");
        };
    }

});
