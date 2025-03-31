document.addEventListener('DOMContentLoaded', () => {
    cargarMonedas();
});

document.getElementById('formRegistroMoneda').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const codigo = document.getElementById('codigo').value.trim();
    
    if (!nombre || !codigo) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/monedas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, codigo }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la moneda.');
        }

        showModal('¡Moneda registrada correctamente!', true);
        document.getElementById('formRegistroMoneda').reset();
        cargarMonedas();
        
        // 🔥 NUEVO: Notificar a la ventana principal para actualizar el select
        window.parent.postMessage('actualizarMonedas', '*');
        
        // Cerrar el modal después de 2 segundos (opcional)
        setTimeout(() => {
            window.parent.bootstrap.Modal.getInstance(window.parent.document.getElementById('modalMoneda')).hide();
        }, 2000);

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

async function buscarMoneda() {
    const idMoneda = document.getElementById('idMoneda').value.trim();
    if (!idMoneda) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/monedas/${idMoneda}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'No se encontró la moneda.');
        }
        const moneda = await response.json();
        // Rellenar los campos del formulario sin mostrar mensaje de éxito
        document.getElementById('nombre').value = moneda.nombre;
        document.getElementById('codigo').value = moneda.codigo;
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

// Función para eliminar un movimiento y limpiar el formulario
async function eliminarMoneda(id) {
    if (!id) {
        showModal('ID inválido. No se puede eliminar la moneda.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/monedas/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar la moneda.');
        }
        showModal('¡Moneda eliminada correctamente!', true);
        // Limpiar el formulario después de eliminar
        document.getElementById('formRegistroMoneda').reset();
        document.getElementById('idMoneda').value = '';

        // Recargar la lista de movimientos
        cargarMonedas();
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

// Función para cargar los movimientos registrados
async function cargarMonedas() {
    try {
        const response = await fetch('/api/almacen/moneda');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const monedas = await response.json();
        const tableBody = document.getElementById('monedasTableBody');
        tableBody.innerHTML = ''; // Limpiar la tabla antes de recargar
        if (Array.isArray(monedas) && monedas.length > 0) {
            monedas.forEach(moneda => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${moneda.idMoneda}</td>
                    <td>${moneda.nombre}</td>
                    <td>${moneda.codigo}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No hay monedas registradas.</td></tr>`;
        }
    } catch (error) {
        console.error('Error al cargar las monedas:', error);
    }
}

// Función para mostrar el modal personalizado
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');
    const modalElement = document.getElementById('customModal');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;
    modalButton.textContent = "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    // Eliminar eventos previos para evitar acumulación
    modalButton.replaceWith(modalButton.cloneNode(true));
    const newModalButton = document.getElementById('modalButton');

    newModalButton.addEventListener('click', () => {
        // Si se elimina esta línea, ya no redirige automáticamente
        // window.location.href = '/vistaAlmacen.html'; 

        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide(); // Cierra el modal
    });

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}