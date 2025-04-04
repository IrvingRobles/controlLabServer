document.addEventListener("DOMContentLoaded", () => {
    const tablaRegistros = document.querySelector("#listadoRegistros");
    const filtroClave = document.querySelector("#filtroClave");
    const filtroEmpresa = document.querySelector("#filtroEmpresa");
    const filtroFecha = document.querySelector("#filtroFecha");
    const filtroResultado = document.querySelector("#filtroResultado");
    const exportPDFBtn = document.querySelector("#exportPDF");
    const restablecerFoliosBtn = document.querySelector("#restablecerFolios");


    let folio = 1; // Variable para mantener el folio dinámico

    // Cargar registros al iniciar
   // Función para cargar los registros en tabla y cards
async function cargarRegistros() {
    try {
        const usuario = JSON.parse(localStorage.getItem("user")); // Obtener el objeto user
        const usuarioActual = usuario?.username; // Obtener el username

        if (!usuarioActual) {
            console.error("Usuario no autenticado");
            return;
        }

        const respuesta = await fetch("/api/registro/obtenerAsignados", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "usuario": usuarioActual // Enviar username al backend
            }
        });

        if (!respuesta.ok) throw new Error("Error al cargar los registros");

        const data = await respuesta.json();
        const registros = data.registros;

        // Limpiar tabla y cards antes de insertar nuevos datos
        document.getElementById("listadoRegistros").innerHTML = "";
        document.getElementById("listaRegistrosCards").innerHTML = "";

        // Mostrar registros en tabla
        mostrarRegistrosEnTabla(registros);

        // Mostrar registros en cards
        mostrarRegistrosEnCards(registros);

        // Agregar eventos a botones
        agregarEventosBotones();
    } catch (error) {
        console.error("Error al cargar registros:", error);
    }
}
// Mostrar registros en la tabla
function mostrarRegistrosEnTabla(registros) {
    const tabla = document.getElementById("listadoRegistros");

    registros.forEach((registro) => {
        // Formatear la fecha
        const fechaEnvio = new Date(registro.fecha_envio).toLocaleDateString("es-ES");

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${registro.id}</td>
            <td>${registro.clave}</td>
            <td>${registro.OT}</td>
            <td>${registro.empresa}</td>
            <td>${fechaEnvio}</td>
            <td contenteditable="true">${registro.descripcion}</td>
            <td contenteditable="true">${registro.contacto}</td>
            <td>${registro.importe_cotizado}</td>
            <td contenteditable="true">${registro.resultado}</td>
            <td>${registro.empleado_asignado || "No asignado"}</td>
        `;
        tabla.appendChild(fila);
    });
}

// Mostrar registros en las cards
function mostrarRegistrosEnCards(registros) {
    const contenedor = document.getElementById("listaRegistrosCards");

    registros.forEach((registro) => {
        // Formatear la fecha
        const fechaEnvio = new Date(registro.fecha_envio).toLocaleDateString("es-ES");

        let card = document.createElement("div");
        card.className = "col-md-4 mb-3";

        card.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title text-center">
                        <a href="#" class="text-decoration-none" data-bs-toggle="collapse" data-bs-target="#infoRegistro${registro.id}">
                            ${registro.clave} - ${registro.empresa}
                        </a>
                    </h5>
                    <div id="infoRegistro${registro.id}" class="collapse">
                        <p class="card-text"><strong>Orden de Trabajo:</strong> ${registro.OT}</p>
                        <p class="card-text"><strong>Fecha de Envío:</strong> ${fechaEnvio}</p>
                        <p class="card-text"><strong>Descripción:</strong> ${registro.descripcion}</p>
                        <p class="card-text"><strong>Contacto:</strong> ${registro.contacto}</p>
                        <p class="card-text"><strong>Importe Cotizado:</strong> ${registro.importe_cotizado}</p>
                        <p class="card-text"><strong>Resultado:</strong> ${registro.resultado}</p>
                        <p class="card-text"><strong>Persona Asignada:</strong> ${registro.empleado_asignado || "No asignado"}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-primary btn-sm btn-guardar" data-id="${registro.id}">Guardar</button>
                            <button class="btn btn-warning btn-sm btn-detalles" data-id="${registro.id}">Hacer Cotización</button>
                            <button class="btn btn-success btn-sm btn-orden-trabajo" data-id="${registro.id}">Generar OT</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}


// Filtrar registros dinámicamente
function filtrarRegistros() {
    const filtroClaveValue = filtroClave.value.toLowerCase();
    const filtroEmpresaValue = filtroEmpresa.value.toLowerCase();
    const filtroFechaValue = filtroFecha.value;
    const filtroResultadoValue = filtroResultado.value.toLowerCase();

    const filas = tablaRegistros.querySelectorAll("tr");
    const cards = document.querySelectorAll("#listaRegistrosCards .col-md-4");

    // Filtrar en la tabla
    filas.forEach((fila) => {
        const clave = fila.children[1].textContent.toLowerCase();
        const empresa = fila.children[3].textContent.toLowerCase();
        const fecha = fila.children[4].textContent;
        const resultado = fila.children[8].textContent.toLowerCase();

        const mostrar =
            (!filtroClaveValue || clave.includes(filtroClaveValue)) &&
            (!filtroEmpresaValue || empresa.includes(filtroEmpresaValue)) &&
            (!filtroFechaValue || fecha.includes(filtroFechaValue)) &&
            (!filtroResultadoValue || resultado.includes(filtroResultadoValue));

        fila.style.display = mostrar ? "" : "none";
    });

    // Filtrar en las cards
    cards.forEach((card) => {
        const clave = card.querySelector(".card-title").textContent.toLowerCase();
        const empresa = card.querySelector(".card-title").textContent.toLowerCase();
        const fecha = card.querySelector(".card-text").textContent.toLowerCase();
        const resultado = card.querySelectorAll(".card-text")[5].textContent.toLowerCase();  // Resultado es el sexto .card-text

        const mostrar =
            (!filtroClaveValue || clave.includes(filtroClaveValue)) &&
            (!filtroEmpresaValue || empresa.includes(filtroEmpresaValue)) &&
            (!filtroFechaValue || fecha.includes(filtroFechaValue)) &&
            (!filtroResultadoValue || resultado.includes(filtroResultadoValue));

        card.style.display = mostrar ? "" : "none";
    });
}

   // <button class="btn btn-danger btn-sm btn-eliminar" data-id="${registro.id}">Eliminar</button>


    function redirigirADetalles() {
        const botonesDetalles = document.querySelectorAll(".btn-detalles");

        botonesDetalles.forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                window.location.href = `/detalle.html?id=${id}`;
            });
        });
    }

    function redirigirAOrdenTrabajo() {
        const botonesOT = document.querySelectorAll(".btn-orden-trabajo");

        botonesOT.forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                window.location.href = `./OT.html?id=${id}`;
            });
        });
    }

    // Función para actualizar un registro
    async function guardarRegistro(id, fila) {
        const datosActualizados = {
            clave: fila.children[1]?.textContent?.trim(),
            OT: fila.children[2]?.textContent?.trim(),
            empresa: fila.children[3]?.textContent?.trim(),
            fechaEnvio: fila.children[4]?.textContent?.trim(),
            descripcion: fila.children[5]?.textContent?.trim(),
            contacto: fila.children[6]?.textContent?.trim(),
            importeCotizado: fila.children[7]?.textContent?.trim(),
            resultado: fila.children[8]?.textContent?.trim()
        };

        console.log("Datos enviados al backend:", datosActualizados); // Verificar datos antes de enviarlos

        try {
            const respuesta = await fetch(`/api/registro/actualizar/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados),
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json();
                throw new Error(errorData.mensaje || "Error al guardar los cambios");
            }

            alert("Registro actualizado con éxito.");
        } catch (error) {
            console.error("Error al guardar los cambios:", error);
            alert("Error al guardar los cambios: " + error.message);
        }
    }

    // Asignar evento de guardado a los botones
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".btn-guardar").forEach(boton => {
            boton.addEventListener("click", () => {
                const fila = boton.closest("tr"); // Encuentra la fila de la tabla
                const id = fila.dataset.id; // Asegurar que cada fila tenga un `data-id`

                if (!id) {
                    alert("No se pudo obtener el ID del registro.");
                    return;
                }

                guardarRegistro(id, fila);
            });
        });
    });

    // Función para asignar el evento de guardar en los botones
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".btn-guardar").forEach(boton => {
            boton.addEventListener("click", () => {
                const fila = boton.closest("tr"); // Encuentra la fila de la tabla
                const id = fila.dataset.id; // Asegúrate de que cada fila tiene un `data-id`

                if (!id) {
                    alert("No se pudo obtener el ID del registro.");
                    return;
                }

                guardarRegistro(id, fila);
            });
        });
    });
    // Eliminar un registro
    async function eliminarRegistro(id) {
        try {
            const respuesta = await fetch(`/api/registro/eliminar/${id}`, {
                method: "DELETE",
            });

            if (!respuesta.ok) throw new Error("Error al eliminar el registro");

            alert("Registro eliminado con éxito.");
            cargarRegistros(); // Recargar los registros
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        }
    }

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


    // Restablecer folios (función de ejemplo, adaptarla según tu lógica)
    function restablecerFolios() {
        folio = 1; // Restablecer el contador de folios
        alert("Folio restablecido a 1.");
    }

    // Agregar eventos a los botones de guardar y eliminar
    function agregarEventosBotones() {
        const botonesGuardar = document.querySelectorAll(".btn-guardar");
        const botonesEliminar = document.querySelectorAll(".btn-eliminar");

        botonesGuardar.forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                const fila = e.target.closest("tr");
                guardarRegistro(id, fila);
            });
        });

        botonesEliminar.forEach((boton) => {
            boton.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                eliminarRegistro(id);
            });
        });

        redirigirADetalles();
        redirigirAOrdenTrabajo();

    }

    // Eventos de filtro
    filtroClave.addEventListener("input", filtrarRegistros);
    filtroEmpresa.addEventListener("input", filtrarRegistros);
    filtroFecha.addEventListener("input", filtrarRegistros);
    filtroResultado.addEventListener("input", filtrarRegistros);

    // Cargar los registros al iniciar
    cargarRegistros();
});
