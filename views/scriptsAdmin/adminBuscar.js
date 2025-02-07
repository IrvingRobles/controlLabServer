document.addEventListener("DOMContentLoaded", () => {
    const tablaRegistros = document.querySelector("#tablaSolicitudes");
    const filtroClave = document.querySelector("#buscarInput");
    const exportPDFBtn = document.getElementById("exportPDF");

    if (!tablaRegistros || !filtroClave) {
        console.error("Error: No se encontraron los elementos necesarios en el DOM.");
        return;
    }

    // Filtrar solicitudes
    function filtrarSolicitudes() {
        const filtro = filtroClave.value.toLowerCase();
        const filas = tablaRegistros.querySelectorAll("tbody tr");

        filas.forEach((fila) => {
            const clave = fila.children[1].textContent.toLowerCase();
            const empresa = fila.children[3].textContent.toLowerCase();
            fila.style.display = clave.includes(filtro) || empresa.includes(filtro) ? "" : "none";
        });
    }

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
        } catch (error) {
            console.error("Error en la asignación:", error);
            alert(`Error en la asignación: ${error.message}`);
        }
    }

    // Cargar registros desde la API
    async function cargarRegistros() {
        try {
            const respuesta = await fetch("/api/registro/obtener");
            if (!respuesta.ok) throw new Error("Error al cargar registros");

            const data = await respuesta.json();
            tablaRegistros.querySelector("tbody").innerHTML = "";

            data.registros.forEach((registro) => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${registro.id}</td>
                    <td contenteditable="true">${registro.clave}</td>
                    <td>${registro.OT}</td>
                    <td>${registro.empresa}</td>
                    <td>${registro.fecha_envio}</td>
                    <td contenteditable="true">${registro.descripcion}</td>
                    <td>${registro.contacto}</td>
                    <td>${registro.importe_cotizado}</td>
                    <td contenteditable="true">${registro.resultado}</td>
                    <td>${registro.empleado_asignado || "No asignado"}</td>
                    <td>
                        <button class="btn btn-primary btn-sm btn-asignar" data-id="${registro.id}">Asignar</button>
                        <button class="btn btn-success btn-sm btn-guardar" data-id="${registro.id}">Guardar</button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${registro.id}">Eliminar</button>
                    </td>
                `;

                tablaRegistros.querySelector("tbody").appendChild(fila);
            });

            document.querySelectorAll(".btn-asignar").forEach(boton => boton.addEventListener("click", (e) => {
                mostrarModalAsignacion(e.target.dataset.id);
            }));

            document.querySelectorAll(".btn-guardar").forEach(boton => boton.addEventListener("click", (e) => {
                guardarRegistro(e.target.dataset.id, e.target.closest("tr"));
            }));

            document.querySelectorAll(".btn-eliminar").forEach(boton => boton.addEventListener("click", (e) => {
                eliminarRegistro(e.target.dataset.id);
            }));

        } catch (error) {
            console.error("Error al cargar registros:", error);
        }
    }

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

    filtroClave.addEventListener("input", filtrarSolicitudes);
<<<<<<< HEAD
   
=======
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
    exportPDFBtn.addEventListener("click", exportPDF);
    cargarRegistros();

    document.getElementById("exportPDF").addEventListener("click", exportPDF);
    function exportPDF() {
        const { jsPDF } = window.jspdf;

        // Solicitar número de revisión
        const revision = prompt("Ingrese el número de revisión:", "03");
        if (!revision) return; // Si no se ingresa un número de revisión, no exporta

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
            doc.save(`Cotizacion_Folio_${folioFormateado}.pdf`);
        };

        logo.onerror = function () {
            alert("Error al cargar el logo. Verifique la ruta y el formato del archivo.");
        };
    }

});
