document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    const campos = [
        "id", "clave", "OT", "empresa", "fecha_envio", "descripcion", "contacto",
        "importe_cotizado", "resultado", "creadoPor", "empleado_asignado", "fecha_inicio",
        "fecha_termino", "contrato_pedido", "lugar", "observaciones", "facturas",
        "cliente", "tipo_servicio", "nombre_cliente"
    ];

    // 🔹 Función para asignar valores a los inputs
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (id === "tipo_servicio" && value) {
            try {
                // Convertir a array si es string separada por comas
                const parsedValue = typeof value === "string" ? value.split(",").map(v => v.trim()) : Array.isArray(value) ? value : JSON.parse(value);

                document.querySelectorAll(`#${id} .form-check-input`).forEach(checkbox => {
                    checkbox.checked = parsedValue.includes(checkbox.value);
                });
            } catch (e) {
                console.error("Error al parsear tipo_servicio:", e);
            }
        } else if (element.type === "date" && value) {
            const dateObj = new Date(value);
            element.value = isNaN(dateObj) ? "" : dateObj.toISOString().split("T")[0];
        } else {
            element.value = value ?? "";
        }
    };

    // 🔹 Función para obtener valores de los inputs
    function getValue(id) {
        const element = document.getElementById(id);
        if (!element) return null;

        if (id === "tipo_servicio") {
            return [...document.querySelectorAll(`#${id} .form-check-input:checked`)]
                .map(checkbox => checkbox.value);
        }
        return element.value.trim();
    }

    // 🔹 Cargar datos de la OT si hay un ID en la URL
    if (id) {
        try {
            console.log(`📡 Consultando OT con ID: ${id}...`);

            const response = await fetch(`/api/registro/obtenerOT?id=${id}`);
            const data = await response.json();

            console.log("✅ Datos obtenidos de la API:", data);

            if (data && data.id) {
                campos.forEach(field => setValue(field, data[field] || ""));
            } else {
                alert("No se encontraron datos para esta Orden de Trabajo.");
            }
        } catch (error) {
            console.error("❌ Error al obtener los datos de la OT:", error);
            alert("Hubo un problema al cargar los datos de la OT.");
        }
    }


    async function subirPDFAlServidor(formData) {
        try {
            const response = await fetch("/guardar-pdf-ot", {
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
    
    function obtenerIniciales(texto) {
        if (!texto) return ""; // Si es null o undefined, devolver cadena vacía
        if (Array.isArray(texto)) texto = texto.join(" "); // Convertir array a string si es necesario
        return String(texto) // Asegurar que sea string
            .split(" ") // Separar por espacios
            .map((palabra) => palabra.charAt(0).toUpperCase()) // Tomar la primera letra
            .join(""); // Unirlas
    }
    
    function guardarOT() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("portrait", "mm", "a4");
    
        // Logo y encabezado
        const logo = new Image();
        logo.src = "./img/logo.jpg";
    
        logo.onload = function () {
            doc.rect(10, 10, 190, 30);
            doc.addImage(logo, "JPEG", 12, 12, 26, 26);
    
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("CALIBRACIONES TECNICAS DE MEXICO, S.A. DE C.V.", 50, 18);
            doc.setFontSize(10);
            doc.text("SERVICIO DE MANTENIMIENTO, CALIBRACION Y EVALUACION DE EQUIPOS ANALITICOS.", 50, 23);
            doc.text("R.F.C.: CTM-050602-332", 50, 28);
    
            doc.setFontSize(12);
            doc.setTextColor(0, 153, 76);
            doc.text("Orden de Trabajo", 10, 50);
            doc.setTextColor(0, 0, 0);
    
            // Diseño de tabla
            let y = 60;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Datos de la Orden de Trabajo:", 10, y);
            y += 5;
    
            doc.setFont("helvetica", "normal");
            const columnWidths = [50, 140];
            const rowHeight = 7;
    
            campos.forEach((campo) => {
                let valorCampo = campo === "tipo_servicio" ? getValue("tipo_servicio") : getValue(campo);
    
                if (Array.isArray(valorCampo)) {
                    valorCampo = valorCampo.join(", ");
                } else if (valorCampo === null || valorCampo === undefined) {
                    return;
                } else {
                    valorCampo = String(valorCampo).trim();
                }
    
                if (!valorCampo) return;
    
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
    
                doc.rect(10, y, columnWidths[0], rowHeight);
                doc.rect(60, y, columnWidths[1], rowHeight);
    
                doc.setFont("helvetica", "bold");
                doc.text(`${campo.replace(/_/g, " ").toUpperCase()}:`, 12, y + 5);
                doc.setFont("helvetica", "normal");
    
                doc.text(valorCampo, 62, y + 5);
    
                y += rowHeight;
            });
    
            // 🔹 Generar nombre de archivo
            const cliente = obtenerIniciales(getValue("cliente"));
            const empresa = obtenerIniciales(getValue("empresa"));
            const empleado = obtenerIniciales(getValue("empleado_asignado"));
            const fecha = getValue("fecha_inicio") || new Date().toISOString().split("T")[0];
            const tipoServicio = obtenerIniciales(getValue("tipo_servicio") || "");
    
            const nombreArchivo = `${cliente}_${empresa}_${empleado}_${fecha}_${tipoServicio}.pdf`;
    
            // 🔹 Guardar PDF en el navegador
            doc.save(nombreArchivo);
    
            // 🔹 Generar el PDF como un blob
            const pdfBlob = doc.output("blob");
    
            // 🔹 Crear FormData para enviar al servidor
            const formData = new FormData();
            formData.append("pdf", pdfBlob, nombreArchivo);
    
            // 🔹 Subir el PDF al servidor
            subirPDFAlServidor(formData);
        };
    }
    document.getElementById("actualizarOT").addEventListener("click", async function () {
        // Obtener datos del formulario
        const formData = {
            id: document.getElementById("id").value,
            clave: document.getElementById("clave").value,
            OT: document.getElementById("OT").value,
            empresa: document.getElementById("empresa").value,
            fecha_envio: document.getElementById("fecha_envio").value,
            descripcion: document.getElementById("descripcion").value,
            contacto: document.getElementById("contacto").value,
            importe_cotizado: document.getElementById("importe_cotizado").value,
            resultado: document.getElementById("resultado").value,
            creadoPor: document.getElementById("creadoPor").value,
            empleado_asignado: document.getElementById("empleado_asignado").value,
            fecha_inicio: document.getElementById("fecha_inicio").value,
            fecha_termino: document.getElementById("fecha_termino").value,
            contrato_pedido: document.getElementById("contrato_pedido").value,
            lugar: document.getElementById("lugar").value,
            observaciones: document.getElementById("observaciones").value,
            facturas: document.getElementById("facturas").value,
            tipo_servicio: obtenerServiciosSeleccionados() // Ahora envía un string separado por comas
        };
    
        console.log("📤 Datos enviados al backend:", formData);
    
        // Validar que haya un ID antes de enviar
        if (!formData.id) {
            alert("⚠️ Debes seleccionar una Orden de Trabajo para actualizar.");
            return;
        }
    
        try {
            // Enviar los datos al backend
            const response = await fetch("/api/registro/actualizarOT", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // Convertir correctamente a JSON
            });
    
            // Manejo de respuesta
            const result = await response.json();
            if (response.ok) {
                alert("✅ Orden de trabajo actualizada correctamente");
            } else {
                alert("❌ Error: " + result.mensaje);
            }
        } catch (error) {
            console.error("❌ Error al actualizar la OT:", error);
            alert("❌ Error en la solicitud. Inténtalo nuevamente.");
        }
    });
    
    // Función para obtener los valores de los checkboxes seleccionados en formato STRING
    function obtenerServiciosSeleccionados() {
        const checkboxes = document.querySelectorAll("#tipo_servicio .form-check-input:checked");
        return Array.from(checkboxes).map(cb => cb.value).join(", "); // Convertir a string separado por comas
    }
    
        
        // 🔹 Función de actualización (estructura inicial)
        function actualizarPDF() {
            // Aquí puedes actualizar datos antes de regenerar el PDF
            guardarOT();
        }
        
        
        // Asignar eventos
        const guardarOTBtn = document.getElementById("guardarOT");
        if (guardarOTBtn) {
            guardarOTBtn.addEventListener("click", guardarOT);
        }
        
});  


