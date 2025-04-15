document.addEventListener("DOMContentLoaded", function () {
    obtenerClientes();

    const crearForm = document.getElementById("crearClienteForm");
    if (crearForm) {
        crearForm.addEventListener("submit", async function (e) {
            e.preventDefault();
        
            const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";
        
            const clienteData = {
                nombre_cliente: getValue("nombre_cliente"),
                empresa: getValue("empresa_Cliente"),
                razon_social: getValue("razon_socialCliente"),
                rfc: getValue("rfc"),
                correo_electronico: getValue("correo_electronico"),
                telefono_contacto: getValue("telefono_contacto"),
                calle: getValue("calle"),
                ciudad: getValue("ciudad"),
                estado: getValue("estado"),
                pais: getValue("pais"),
                codigo_postal: getValue("codigo_postal"),
            };
        
            if (!clienteData.nombre_cliente || !clienteData.rfc) {
                return Swal.fire("Campos obligatorios", "El nombre del cliente y el RFC son obligatorios.", "warning");
            }
        
            try {
                const response = await fetch("/api/registro/crearCliente", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(clienteData),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    Swal.fire("Éxito", result.mensaje || "Cliente creado exitosamente.", "success");
        
                    // ✅ Cierra el modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById("modalNuevoCliente"));
                    modal.hide();
        
                    crearForm.reset();
                    obtenerClientes();
                } else {
                    Swal.fire("Error", result.mensaje || "Hubo un error al crear el cliente.", "error");
                }
            } catch (error) {
                console.error("Error al crear cliente:", error);
                Swal.fire("Error del servidor", "No se pudo crear el cliente.", "error");
            }
        });
        
    }
});

async function obtenerClientes() {
    try {
        const response = await fetch("/api/registro/listaClientes");
        const clientes = await response.json();

        const container = document.getElementById("clientesContainer");
        if (!container) return;

        container.innerHTML = "";

        clientes.forEach(cliente => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("col");

            tarjeta.innerHTML = `
                <div class="card h-100 shadow-sm rounded-3xl border-0">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title d-flex align-items-center gap-2 text-primary">
                            <i data-lucide="user-round"></i> ${cliente.nombre_cliente}
                        </h5>
                        <p class="card-text text-muted"><strong>Empresa:</strong> ${cliente.empresa || "N/A"}</p>
                        <p class="card-text text-muted"><strong>RFC:</strong> ${cliente.rfc}</p>
                        <p class="card-text text-muted"><strong>Correo:</strong> ${cliente.correo_electronico || "N/A"}</p>
                        <p class="card-text text-muted"><strong>Teléfono:</strong> ${cliente.telefono_contacto || "N/A"}</p>
                        <p class="card-text text-muted"><strong>Dirección:</strong> ${cliente.calle}, ${cliente.ciudad}, ${cliente.estado}, ${cliente.pais}, ${cliente.codigo_postal}</p>

                        <div class="d-flex justify-content-end gap-2 mt-3">
                            <button onclick="editarCliente(${cliente.id_cliente})" class="btn btn-warning btn-sm d-flex align-items-center gap-1">
                                <i data-lucide="pencil-line" class="w-4 h-4"></i> Editar
                            </button>
                            <button onclick="eliminarCliente(${cliente.id_cliente})" class="btn btn-danger btn-sm d-flex align-items-center gap-1">
                                <i data-lucide="trash-2" class="w-4 h-4"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(tarjeta);
        });

        lucide.createIcons(); // iconos dinámicos
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        Swal.fire("Error", "No se pudo obtener la lista de clientes.", "error");
    }
}

function editarCliente(id_cliente) {
    fetch(`/api/registro/clienteDetalles/${id_cliente}`)
        .then(res => res.json())
        .then(cliente => {
            const set = (id, val) => document.getElementById(id).value = val || "";

            set("edit_id_cliente", cliente.id_cliente);
            set("edit_nombre_cliente", cliente.nombre_cliente);
            set("edit_empresa", cliente.empresa);
            set("edit_razon_social", cliente.razon_social);
            set("edit_rfc", cliente.rfc);
            set("edit_correo", cliente.correo_electronico);
            set("edit_telefono", cliente.telefono_contacto);
            set("edit_calle", cliente.calle);
            set("edit_ciudad", cliente.ciudad);
            set("edit_estado", cliente.estado);
            set("edit_pais", cliente.pais);
            set("edit_codigo_postal", cliente.codigo_postal);

            const modal = new bootstrap.Modal(document.getElementById("editarClienteModal"));
            modal.show();
        })
        .catch(error => {
            console.error("Error al obtener datos del cliente:", error);
            Swal.fire("Error", "No se pudieron cargar los datos del cliente.", "error");
        });
}

async function guardarCambiosCliente() {
    const id_cliente = document.getElementById("edit_id_cliente").value;

    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

    const clienteData = {
        nombre_cliente: getValue("edit_nombre_cliente"),
        empresa: getValue("edit_empresa"),
        rfc: getValue("edit_rfc"),
        correo_electronico: document.getElementById("edit_correo").value.trim(),
        telefono_contacto: document.getElementById("edit_telefono").value.trim(),
        calle: document.getElementById("edit_calle").value.trim(),
        ciudad: document.getElementById("edit_ciudad").value.trim(),
        estado: document.getElementById("edit_estado").value.trim(),
        pais: document.getElementById("edit_pais").value.trim(),
        codigo_postal: document.getElementById("edit_codigo_postal").value.trim(),
    };

    if (!clienteData.nombre_cliente || !clienteData.rfc) {
        return Swal.fire("Campos obligatorios", "El nombre y el RFC son obligatorios.", "warning");
    }

    try {
        const response = await fetch(`/api/registro/actualizarCliente/${id_cliente}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(clienteData),
        });

        const result = await response.json();
        Swal.fire("Resultado", result.mensaje, response.ok ? "success" : "error");

        if (response.ok) {
            obtenerClientes();
            document.querySelector("#editarClienteModal .btn-close").click();
        }
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        Swal.fire("Error", "No se pudo actualizar el cliente.", "error");
    }
}

async function eliminarCliente(id_cliente) {
    const { isConfirmed } = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esto",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });

    if (!isConfirmed) return;

    try {
        const response = await fetch(`/api/registro/eliminarCliente/${id_cliente}`, {
            method: "DELETE",
        });

        const result = await response.json();
        Swal.fire("Eliminado", result.mensaje, "success");
        obtenerClientes();
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        Swal.fire("Error", "No se pudo eliminar el cliente.", "error");
    }
}
