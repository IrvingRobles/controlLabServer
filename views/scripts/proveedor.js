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
        document.getElementById('formRegistroProveedor').reset();
        cargarProveedores();

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
    showModalConfirm('¿Estás seguro de eliminar este proveedor?', async () => {
        try {
            const response = await fetch(`/api/almacen/proveedor/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el proveedor.');
            }
            showModal('Proveedor eliminado correctamente.', true);
            document.getElementById('idProveedor').value = '';
            document.getElementById('nombre').value = '';
            cargarProveedores();
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    });
}

async function cargarProveedores() {
    try {
        const response = await fetch('/api/almacen/id/proveedores');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const proveedores = await response.json();
        const listaProveedores = document.getElementById('listaProveedores');
        listaProveedores.innerHTML = '';

        if (Array.isArray(proveedores) && proveedores.length > 0) {
            proveedores.forEach(proveedor => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${proveedor.idProveedor}</td>
                    <td>${proveedor.nombre}</td>
                `;
                listaProveedores.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
    }
}

function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;
    modalButton.textContent = "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";
    
    modalButton.onclick = () => {
        if (success) cargarProveedores();
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('customModal'));
        modalInstance.hide();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}

function showModalConfirm(message, onConfirm) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = "Confirmación";
    modalTitle.className = "text-warning";
    modalBody.textContent = message;
    modalButton.textContent = "Confirmar";
    modalButton.className = "btn btn-danger";
    
    modalButton.onclick = () => {
        onConfirm();
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('customModal'));
        modalInstance.hide();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}
