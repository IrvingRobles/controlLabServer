document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
        try {
            const response = await fetch(`/api/registro/obtenerOT?id=${id}`);
            const data = await response.json();

            if (data && data.id) {
                const setValue = (id, value) => {
                    const element = document.getElementById(id);
                    if (!element) return;

                    // Si es un input de fecha, convertir al formato adecuado "yyyy-MM-dd"
                    if (element.type === "date" && value) {
                        const dateObj = new Date(value);
                        element.value = dateObj.toISOString().split("T")[0]; // Formato correcto
                    } else {
                        element.value = value || "";
                    }
                };

                setValue("id", data.id);
                setValue("clave", data.clave);
                setValue("fecha_inicio", data.fecha_inicio);
                setValue("fecha_termino", data.fecha_termino);
                setValue("empresa", data.empresa);
                setValue("contrato_pedido", data.contrato_pedido);
                setValue("lugar", data.lugar);
                setValue("descripcion", data.descripcion);
                setValue("empleado_asignado", data.empleado_asignado);
                setValue("observaciones", data.observaciones);
                setValue("facturas", data.facturas);
                setValue("cliente", data.cliente);
            } else {
                alert("No se encontraron datos para esta Orden de Trabajo.");
            }
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            alert("Hubo un problema al cargar los datos de la OT.");
        }
    }

    document.getElementById("guardarOT").addEventListener("click", async () => {
        await enviarDatos("/api/registro/guardarOT", "POST");
    });

    document.getElementById("actualizarOT").addEventListener("click", async () => {
        await enviarDatos("/api/registro/actualizarOT", "PUT");
    });

    async function enviarDatos(url, metodo) {
        const formData = {
            id: document.getElementById("id")?.value,
            clave: document.getElementById("clave")?.value,
            fecha_inicio: document.getElementById("fecha_inicio")?.value,
            fecha_termino: document.getElementById("fecha_termino")?.value,
            empresa: document.getElementById("empresa")?.value,
            contrato_pedido: document.getElementById("contrato_pedido")?.value,
            lugar: document.getElementById("lugar")?.value,
            descripcion: document.getElementById("descripcion")?.value,
            empleado_asignado: document.getElementById("empleado_asignado")?.value,
            observaciones: document.getElementById("observaciones")?.value,
            facturas: document.getElementById("facturas")?.value,
            cliente: document.getElementById("cliente")?.value,
        };

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Orden de Trabajo guardada correctamente.");
                window.location.href = "index1.html";
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error al guardar la OT:", error);
            alert("Hubo un problema al guardar la OT.");
        }
    }
});
