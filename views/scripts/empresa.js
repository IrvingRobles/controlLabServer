document.addEventListener('DOMContentLoaded', () => {
    cargarEmpresas(); // Cargar las empresas registradas al cargar la página
});

document.getElementById('formRegistroEmpresa').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const rfc = document.getElementById('rfc').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    if (!codigo || !nombre || !rfc || !direccion) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, nombre, rfc, direccion }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la empresa.');
        }

        showModal('¡Empresa registrada correctamente!', true);
        document.getElementById('formRegistroEmpresa').reset();
        cargarEmpresas(); // Recargar la lista de empresas
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

async function buscarEmpresa() {
    const idEmpresa = document.getElementById('idEmpresa').value.trim();
    if (!idEmpresa) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/empresas/${idEmpresa}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'No se encontró la empresa.');
        }
        const empresa = await response.json();
        document.getElementById('codigo').value = empresa.codigo;
        document.getElementById('nombre').value = empresa.nombre;
        document.getElementById('rfc').value = empresa.rfc;
        document.getElementById('direccion').value = empresa.direccion;
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

async function eliminarEmpresa(id) {
    if (!id) {
        showModal('ID inválido. No se puede eliminar la empresa.', false);
        return;
    }
    showModal('¿Estás seguro de que deseas eliminar esta empresa?', true, async () => {
        try {
            const response = await fetch(`/api/almacen/empresas/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar la empresa.');
            }
            showModal('¡Empresa eliminada correctamente!', true);
            document.getElementById('formRegistroEmpresa').reset();
            document.getElementById('idEmpresa').value = '';
            cargarEmpresas();
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    }, 'Eliminar', 'btn-danger');
}

async function cargarEmpresas() {
    try {
        const response = await fetch('/api/almacen/id/empresas');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const empresas = await response.json();
        const tableBody = document.getElementById('empresasTableBody');
        tableBody.innerHTML = '';

        if (Array.isArray(empresas) && empresas.length > 0) {
            empresas.forEach(empresa => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${empresa.idEmpresa}</td>
                    <td>${empresa.codigo}</td>
                    <td>${empresa.nombre}</td>`;
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay empresas registradas.</td></tr>`;
        }
    } catch (error) {
        console.error('Error al cargar las empresas:', error);
    }
}

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