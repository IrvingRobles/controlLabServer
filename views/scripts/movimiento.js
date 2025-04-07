document.addEventListener('DOMContentLoaded', () => {
    cargarMovimientos();
});

document.getElementById('formRegistroMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    
    if (!nombre || !descripcion) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/movimiento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar el movimiento.');
        }

        showModal('¡Movimiento registrado correctamente!', true);
        document.getElementById('formRegistroMovimiento').reset();
        cargarMovimientos();
        
        // 🔥 NUEVO: Notificar a la ventana principal para actualizar el select
        window.parent.postMessage('actualizarMovimientos', '*');
        
        // Cerrar el modal después de 2 segundos (opcional)
        setTimeout(() => {
            window.parent.bootstrap.Modal.getInstance(window.parent.document.getElementById('modalMovimiento')).hide();
        }, 2000);

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

async function buscarMovimiento() {
    const idMovimiento = document.getElementById('idMovimiento').value.trim();

    if (!idMovimiento) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }

    try {
        const response = await fetch(`/api/almacen/movimiento/id/${idMovimiento}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'No se encontró el movimiento.');
        }

        const movimiento = await response.json();

        // Rellenar los campos del formulario sin mostrar mensaje de éxito
        document.getElementById('nombre').value = movimiento.nombre;
        document.getElementById('descripcion').value = movimiento.descripcion;

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

// Función para eliminar un movimiento y limpiar el formulario
async function eliminarMovimiento(id) {
    if (!id) {
        showModal('ID inválido. No se puede eliminar el movimiento.', false);
        return;
    }

    showModal('¿Estás seguro de que deseas eliminar este movimiento?', true, async () => {
        try {
            const response = await fetch(`/api/almacen/movimiento/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el movimiento.');
            }

            showModal('¡Movimiento eliminado correctamente!', true);
            
            // Limpiar el formulario después de eliminar
            document.getElementById('formRegistroMovimiento').reset();
            document.getElementById('idMovimiento').value = '';

            // Recargar la lista de movimientos
            cargarMovimientos();
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    }, 'Eliminar', 'btn-danger');
}

// Función para cargar los movimientos registrados
async function cargarMovimientos() {
    try {
        const response = await fetch('/api/almacen/id/movimientos');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const movimientos = await response.json();
        const tableBody = document.getElementById('movimientosTableBody');
        tableBody.innerHTML = ''; // Limpiar la tabla antes de recargar

        if (Array.isArray(movimientos) && movimientos.length > 0) {
            movimientos.forEach(movimiento => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${movimiento.idMovimiento}</td>
                    <td>${movimiento.nombre}</td>
                    <td>${movimiento.descripcion}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No hay movimientos registrados.</td></tr>`;
        }
    } catch (error) {
        console.error('Error al cargar los movimientos:', error);
    }
}

// Función para mostrar el modal personalizado
function showModal(message, success, confirmAction = null, buttonText = 'Cerrar', buttonClass = 'btn-secondary') {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;
    modalButton.textContent = buttonText;
    modalButton.className = `btn ${buttonClass}`;

    if (confirmAction) {
        modalButton.onclick = () => {
            confirmAction();
            bootstrap.Modal.getInstance(document.getElementById('customModal')).hide();
        };
    } else {
        modalButton.onclick = () => {
            bootstrap.Modal.getInstance(document.getElementById('customModal')).hide();
        };
    }

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}
