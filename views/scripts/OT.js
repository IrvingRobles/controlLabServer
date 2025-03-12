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
                const parsedValue = Array.isArray(value) ? value : JSON.parse(value);
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

    // 🔹 Función para guardar PDF
    function guardarOT() {
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
                let valorCampo = campo === "tipo_servicio" ? getValue("tipo_servicio") : getValue(campo);
            
                // Convertir a string para evitar errores con trim()
                if (Array.isArray(valorCampo)) {
                    valorCampo = valorCampo.join(", ");  // Convierte array en string separado por comas
                } else if (valorCampo === null || valorCampo === undefined) {
                    return;  // Si es null o undefined, no lo mostramos
                } else {
                    valorCampo = String(valorCampo).trim(); // Convertir a string y quitar espacios
                }
            
                // Si después de convertir sigue vacío, no imprimirlo
                if (!valorCampo) return;
            
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            
                doc.rect(10, y, columnWidths[0], rowHeight);
                doc.rect(60, y, columnWidths[1], rowHeight);
            
                doc.setFont("helvetica", "bold");
                doc.text(`${campo.replace(/_/g, ' ').toUpperCase()}:`, 12, y + 5);
                doc.setFont("helvetica", "normal");
            
                doc.text(valorCampo, 62, y + 5);
            
                y += rowHeight;
            });
            
            doc.save(`OrdenTrabajo_${getValue("OT")}.pdf`);
        };
    }

    // 🔹 Asignar eventos
    const guardarOTBtn = document.getElementById("guardarOT");
    if (guardarOTBtn) {
        guardarOTBtn.addEventListener("click", guardarOT);
    }
});
