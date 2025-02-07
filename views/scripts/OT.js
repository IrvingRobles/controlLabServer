document.addEventListener("DOMContentLoaded", async () => {
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
            } else {
                alert("No se encontraron datos para esta Orden de Trabajo.");
            }
        } catch (error) {
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
});
