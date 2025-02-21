document.addEventListener('DOMContentLoaded', () => {
    cargarCondiciones();
});

document.getElementById('formRegistroCondicion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const condiciones = document.getElementById('nombreCondicion').value.trim();
    if (!condiciones) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }
    try {
        const response = await fetch('/api/almacen/condicion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ condiciones }), // Cambié nombreCondicion a condiciones
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la condición.');
        }
        showModal('¡Condición registrada correctamente!', true);
        cargarCondiciones();

        document.getElementById('formRegistroCondicion').reset();

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});


async function buscarCondicion() {
    const idCondicion = document.getElementById('idCondicion').value.trim();
    if (!idCondicion) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/x/condicion/${idCondicion}`);
        if (!response.ok) {
            throw new Error('Error al obtener la condición.');
        }
        const condicion = await response.json();
        document.getElementById('nombreCondicion').value = condicion.condiciones;
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

async function eliminarCondicion(id) {
    if (!id) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    showModal('¿Estás seguro de que deseas eliminar esta condición?', true);
    document.getElementById('modalButton').onclick = async () => {
        try {
            const response = await fetch(`/api/almacen/condicion/id/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Error al eliminar la condición.');
            }
            showModal('Condición eliminada correctamente.', true);
            document.getElementById('idCondicion').value = '';
            document.getElementById('nombreCondicion').value = '';
            cargarCondiciones();
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    };
}

async function cargarCondiciones() {
    try {
        const response = await fetch('/api/almacen/condiciones/id');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const condiciones = await response.json();
        const listaCondiciones = document.getElementById('listaCondiciones');
        listaCondiciones.innerHTML = '';
        condiciones.forEach(condicion => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${condicion.idCondicion}</td>
                <td>${condicion.condiciones}</td>
            `;
            listaCondiciones.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar condiciones:', error);
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

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();

    // Cerrar el modal cuando se haga clic en "Cerrar"
    modalButton.onclick = () => {
        modal.hide();
    };
}