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

        // Manejo de la respuesta dependiendo de la existencia del cliente
        if (response.ok) {
            alert(result.mensaje || "Cliente creado exitosamente.");
            document.getElementById("crearClienteForm").reset();
            obtenerClientes(); // Actualizar la lista de clientes
        } else {
            if (result.mensaje.includes("Ya existe un cliente con este nombre")) {
                alert("¡Error! Ya existe un cliente con este nombre. Por favor, elige otro.");
            } else {
                alert(result.mensaje || "Hubo un error al crear el cliente.");
            }
        }
    } catch (error) {
        console.error("Error al crear cliente:", error);
        alert("Error en el servidor.");
    }
});

// Función para obtener los datos de los clientes
async function obtenerClientes() {
    try {
        const response = await fetch("/api/registro/listaClientes");
        const clientes = await response.json();

        const clientesContainer = document.getElementById("clientesContainer");
        clientesContainer.innerHTML = ""; // Limpiar el contenedor

        clientes.forEach(cliente => {
            // Crear tarjeta de cliente
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("col-md-4", "mb-4"); // Columna Bootstrap
            tarjeta.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h5>${cliente.nombre_cliente}</h5>
                    </div>
                    <div class="card-body">
                        <p><strong>RFC:</strong> ${cliente.rfc}</p>
                        <p><strong>Correo:</strong> ${cliente.correo_electronico || "N/A"}</p>
                        <p><strong>Teléfono:</strong> ${cliente.telefono_contacto || "N/A"}</p>
                        <p><strong>Dirección:</strong> ${cliente.calle}, ${cliente.ciudad}, ${cliente.estado}, ${cliente.pais}, ${cliente.codigo_postal}</p>
                    </div>
                    <div class="card-footer text-end">
                        <button class="btn btn-warning btn-sm" onclick="editarCliente(${cliente.id_cliente})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cliente.id_cliente})">Eliminar</button>
                    </div>
                </div>
            `;
            clientesContainer.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        alert("No se pudo obtener la lista de clientes.");
    }
}

// Función para editar un cliente
// Función para abrir el modal con los datos actuales del cliente
function editarCliente(id_cliente) {
    fetch(`/api/registro/obtenerCliente/${id_cliente}`)
        .then(response => response.json())
        .then(cliente => {
            // Llenar los campos del modal con los datos del cliente
            document.getElementById("edit_id_cliente").value = id_cliente;
            document.getElementById("edit_nombre_cliente").value = cliente.nombre_cliente;
            document.getElementById("edit_rfc").value = cliente.rfc;
            document.getElementById("edit_correo").value = cliente.correo_electronico || "";
            document.getElementById("edit_telefono").value = cliente.telefono_contacto || "";
            document.getElementById("edit_calle").value = cliente.calle || "";
            document.getElementById("edit_ciudad").value = cliente.ciudad || "";
            document.getElementById("edit_estado").value = cliente.estado || "";
            document.getElementById("edit_pais").value = cliente.pais || "";
            document.getElementById("edit_codigo_postal").value = cliente.codigo_postal || "";

            // Abrir el modal
            let modal = new bootstrap.Modal(document.getElementById("editarClienteModal"));
            modal.show();
        })
        .catch(error => {
            console.error("Error al obtener datos del cliente:", error);
            alert("No se pudieron cargar los datos.");
        });
}
async function guardarCambiosCliente() {
    const id_cliente = document.getElementById("edit_id_cliente").value;
    
    const clienteData = {
        nombre_cliente: document.getElementById("edit_nombre_cliente").value.trim().toUpperCase(),
        rfc: document.getElementById("edit_rfc").value.trim().toUpperCase(),
        correo_electronico: document.getElementById("edit_correo").value.trim(),
        telefono_contacto: document.getElementById("edit_telefono").value.trim(),
        calle: document.getElementById("edit_calle").value.trim(),
        ciudad: document.getElementById("edit_ciudad").value.trim(),
        estado: document.getElementById("edit_estado").value.trim(),
        pais: document.getElementById("edit_pais").value.trim(),
        codigo_postal: document.getElementById("edit_codigo_postal").value.trim(),
    };

    // Validar que el nombre y el RFC no estén vacíos
    if (!clienteData.nombre_cliente || !clienteData.rfc) {
        alert("El nombre y el RFC son obligatorios.");
        return;
    }

    try {
        const response = await fetch(`/api/registro/actualizarCliente/${id_cliente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clienteData),
        });

        const result = await response.json();
        alert(result.mensaje);

        if (response.ok) {
            obtenerClientes(); // Refrescar la lista
            document.getElementById("editarClienteModal").querySelector(".btn-close").click(); // Cerrar modal
        }
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        alert("No se pudo actualizar el cliente.");
    }
}


// Función para eliminar un cliente
async function eliminarCliente(id_cliente) {
    const confirmacion = confirm("¿Está seguro de que desea eliminar este cliente?");
    if (!confirmacion) return;

    try {
        const response = await fetch(`/api/registro/eliminarCliente/${id_cliente}`, {
            method: "DELETE",
        });

        const textResponse = await response.text(); // Obtiene la respuesta en texto
        console.log("Respuesta del servidor:", textResponse); // Muestra la respuesta en consola

        const result = JSON.parse(textResponse); // Intenta convertirla en JSON
        alert(result.mensaje);
        obtenerClientes(); // Refrescar la lista de clientes
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("No se pudo eliminar el cliente.");
    }
}
