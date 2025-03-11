document.addEventListener("DOMContentLoaded", function () {
    obtenerClientes(); // Cargar clientes al cargar la página
});

document.getElementById("crearClienteForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Función para obtener valores en mayúsculas
    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

    const clienteData = {
        nombre_cliente: getValue("nombre_cliente"),
        razon_social: getValue("razon_social"),
        rfc: getValue("rfc"),
        correo_electronico: getValue("correo_electronico"),
        telefono_contacto: getValue("telefono_contacto"),
        calle: getValue("calle"),
        ciudad: getValue("ciudad"),
        estado: getValue("estado"),
        pais: getValue("pais"),
        codigo_postal: getValue("codigo_postal"),
    };

    // Validar campos obligatorios
    if (!clienteData.nombre_cliente || !clienteData.rfc) {
        alert("El nombre del cliente y el RFC son obligatorios.");
        return;
    }

    try {
        const response = await fetch("/api/registro/crearCliente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clienteData),
        });

        const result = await response.json();
        alert(result.mensaje);

        if (response.ok) {
            document.getElementById("crearClienteForm").reset();
            obtenerClientes(); // Actualizar la tabla
        } else {
            // Si la API devuelve un mensaje de error, mostrarlo
            alert(result.mensaje || "Hubo un error al crear el cliente.");
        }
    } catch (error) {
        console.error("Error al crear cliente:", error);
        alert("Error en el servidor.");
    }
});

// Función para obtener la lista de clientes
async function obtenerClientes() {
    try {
        const response = await fetch("/api/registro/listaClientes");
        const clientes = await response.json();

        const tablaBody = document.getElementById("tablaClientesBody");
        tablaBody.innerHTML = ""; // Limpiar tabla

        clientes.forEach(cliente => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cliente.id_cliente}</td>
                <td>${cliente.nombre_cliente}</td>
                <td>${cliente.rfc}</td>
                <td>${cliente.correo_electronico || "N/A"}</td>
                <td>${cliente.telefono_contacto || "N/A"}</td>
            `;
            tablaBody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        alert("No se pudo obtener la lista de clientes.");
    }
}
