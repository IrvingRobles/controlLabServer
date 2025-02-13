document.addEventListener('DOMContentLoaded', () => {
    cargarProveedores();
});

document.getElementById('formRegistroProveedor').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();

    if (!nombre) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/proveedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar el proveedor.');
        }

        showModal('¡Proveedor registrado correctamente!', true);
        cargarProveedores(); // Recargar la lista de proveedores

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

async function buscarProveedor() {
    const idProveedor = document.getElementById('idProveedor').value.trim();
    if (!idProveedor) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/proveedor/id/${idProveedor}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener el proveedor.');
        }
        const proveedor = await response.json();
        document.getElementById('nombre').value = proveedor.nombre;
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

async function eliminarProveedor(id) {
    if (!id) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    // Mostrar modal de confirmación antes de eliminar
    showModal('¿Estás seguro de que deseas eliminar este proveedor?', true);
    // Modificar el botón del modal para ejecutar la eliminación al confirmar
    const modalButton = document.getElementById('modalButton');
    modalButton.textContent = "Eliminar";
    modalButton.className = "btn btn-danger";
    modalButton.onclick = async () => {
        try {
            const response = await fetch(`/api/almacen/proveedor/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el proveedor.');
            }
            showModal('Proveedor eliminado correctamente.', true);
            // Limpiar el campo de búsqueda
            document.getElementById('idProveedor').value = '';
            document.getElementById('nombre').value = '';
            cargarProveedores(); // Recargar lista
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    };
}


async function cargarProveedores() {
    try {
        const response = await fetch('/api/almacen/id/proveedores');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const proveedores = await response.json();
        // Accede al primer array que contiene los proveedores
        const listaProveedores = document.getElementById('listaProveedores');
        listaProveedores.innerHTML = ''; // Limpiar tabla
        // Verifica si proveedores tiene datos
        if (Array.isArray(proveedores[0])) {
            proveedores[0].forEach(proveedor => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${proveedor.idProveedor}</td>
                    <td>${proveedor.nombre}</td>
                `;
                listaProveedores.appendChild(fila);
            });
        } else {
            console.error("No se encontraron proveedores en la estructura esperada.");
        }

    } catch (error) {
        console.error('Error al cargar proveedores:', error);
    }
}


// Función para mostrar el modal personalizado
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;
    modalButton.textContent = "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    // Evento de cierre sin reemplazar el botón
    modalButton.onclick = () => {
        if (success) {
            document.getElementById('formRegistroProveedor').reset();
            cargarProveedores();
        }
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('customModal'));
        modalInstance.hide();
    };

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}