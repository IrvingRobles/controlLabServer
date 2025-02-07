document.addEventListener("DOMContentLoaded", async () => {
<<<<<<< HEAD
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    const campos = [
        "id", "clave", "OT", "empresa", "fecha_envio", "descripcion", "contacto",
        "importe_cotizado", "resultado", "creadoPor", "empleado_asignado", "fecha_inicio",
        "fecha_termino", "contrato_pedido", "lugar", "observaciones", "facturas", "cliente", "tipo_servicio"
    ];

    const setValue = (id, value) => {
        if (id === "tipo_servicio") {
            // Manejo especial para los checkboxes
            document.querySelectorAll(`#${id} .form-check-input`).forEach(checkbox => {
                checkbox.checked = value.includes(checkbox.value);
            });
        } else {
            const element = document.getElementById(id);
            if (!element) return;
            if (element.type === "date" && value) {
                const dateObj = new Date(value);
                element.value = isNaN(dateObj) ? "" : dateObj.toISOString().split("T")[0];
            } else {
                element.value = value ?? "";
            }
        }
    };

    const getValue = (id) => {
        if (id === "tipo_servicio") {
            // Capturar valores de los checkboxes seleccionados
            const checkboxes = document.querySelectorAll(`#${id} .form-check-input:checked`);
            return Array.from(checkboxes).map(cb => cb.value).join(", ") || "-";
        } else {
            const element = document.getElementById(id);
            return element ? (element.value.trim() || "-") : "-";
        }
    };

    if (id) {
        try {
            const response = await fetch(`/api/registro/obtenerOT?id=${id}`);
            const data = await response.json();
            if (data && data.id) {
                campos.forEach(field => setValue(field, data[field] || ""));
=======
    // Obtener el id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
        try {
            // Hacer la solicitud al servidor para obtener los datos de la OT
            const response = await fetch(`/api/registro/obtenerOT?id=${id}`);
            const data = await response.json();
            
            if (data && data.id) {
                // Rellenar los campos del formulario con los datos obtenidos
                document.getElementById("clave").value = data.id; // Rellenar el campo "Clave"
                document.getElementById("fecha_inicio").value = data.fecha_inicio || "";
                document.getElementById("fecha_termino").value = data.fecha_termino || "";
                document.getElementById("empresa").value = data.empresa;
                document.getElementById("contrato_pedido").value = data.contrato_pedido || "";
                document.getElementById("lugar").value = data.lugar || "";
                document.getElementById("descripcion").value = data.descripcion;
                document.getElementById("empleado_asignado").value = data.empleado_asignado;
                document.getElementById("observaciones").value = data.observaciones || "";
                document.getElementById("facturas").value = data.facturas || "";
>>>>>>> 8810c29 (commit campos OT)
            } else {
                alert("No se encontraron datos para esta Orden de Trabajo.");
            }
        } catch (error) {
<<<<<<< HEAD
            console.error("❌ Error al obtener los datos de la OT:", error);
            alert("Hubo un problema al cargar los datos de la OT.");
        }
    }

    document.getElementById("guardarOT")?.addEventListener("click", async () => {
        await enviarDatos("/api/registro/guardarOT", "POST");
        exportPDF();
    });

    document.getElementById("actualizarOT")?.addEventListener("click", async () => {
        await enviarDatos("/api/registro/actualizarOT", "PUT");
    });

    async function enviarDatos(url, metodo) {
        const formData = Object.fromEntries(campos.map(field => [field, getValue(field)]));

        // Validar que los campos obligatorios no estén vacíos
        const requiredFields = ["id", "clave", "empresa", "contacto", "resultado", "creadoPor", "cliente", "tipo_servicio"];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field] === "-");

        if (missingFields.length > 0) {
            alert(`⚠️ Faltan datos obligatorios: ${missingFields.join(", ")}`);
            return;
        }

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (response.ok) {
                alert(metodo === "POST" ? "✅ Orden de Trabajo guardada correctamente." : "✅ Orden de Trabajo actualizada correctamente.");
            } else {
                alert(`❌ Error: ${result.mensaje || "No se pudo procesar la OT."}`);
            }
        } catch (error) {
            console.error("❌ Error en la solicitud:", error);
            alert("Hubo un problema en la solicitud.");
        }
    }

    function exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("portrait", "mm", "a4");

        // Logo y encabezado
        const logo = new Image();
        logo.src = "./img/logo.jpg";

        logo.onload = function () {
            doc.rect(10, 10, 190, 30); // Marco del encabezado
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
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.rect(10, y, columnWidths[0], rowHeight);
                doc.rect(60, y, columnWidths[1], rowHeight);
                
                doc.setFont("helvetica", "bold");
                doc.text(`${campo.replace(/_/g, ' ').toUpperCase()}:`, 12, y + 5);
                doc.setFont("helvetica", "normal");

                // Asegurar que el tipo de servicio se muestre correctamente en el PDF
                const valorCampo = campo === "tipo_servicio" ? getValue("tipo_servicio") : getValue(campo);
                doc.text(valorCampo, 62, y + 5);

                y += rowHeight;
            });

            doc.save(`OrdenTrabajo_${getValue("OT")}.pdf`);
        };
    }
=======
            console.error("Error al obtener los datos:", error);
            alert("Hubo un problema al cargar los datos de la OT.");
        }
    } else {
        alert("No se proporcionó un ID válido.");
    }

    // Manejo del formulario para guardar los datos
    document.getElementById("ordenTrabajoForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        // Obtener los datos del formulario
        const formData = {
            id: document.getElementById("clave").value,
            fecha_inicio: document.getElementById("fecha_inicio").value,
            fecha_termino: document.getElementById("fecha_termino").value,
            empresa: document.getElementById("empresa").value,
            contrato_pedido: document.getElementById("contrato_pedido").value,
            lugar: document.getElementById("lugar").value,
            descripcion: document.getElementById("descripcion").value,
            empleado_asignado: document.getElementById("empleado_asignado").value,
            observaciones: document.getElementById("observaciones").value,
            facturas: document.getElementById("facturas").value,
        };

        try {
            // Enviar los datos al servidor para guardar o actualizar la OT
            const response = await fetch("/api/registro/guardarOT", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Orden de Trabajo guardada correctamente.");
                window.location.href = "index1.html"; // Redirigir después de guardar
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error al guardar la OT:", error);
            alert("Hubo un problema al guardar la OT.");
        }
    });
>>>>>>> 8810c29 (commit campos OT)
});
