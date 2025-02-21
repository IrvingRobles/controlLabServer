// Función auxiliar para rellenar campos
function rellenarCampos(registro, campos, fechaHoy) {
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = registro[campo] || '';
        }
    });

    const fechaElemento = document.getElementById('fecha');
    if (fechaElemento) {
        fechaElemento.value = fechaHoy || '';
    }
}

// Evento para buscar idAlmacen
document.getElementById('btnBuscarVale').addEventListener('click', async () => {
    const idAlmacen = document.getElementById('idAlmacen').value.trim();
    if (!idAlmacen) {
        showModal('Por favor, ingrese un ID de Almacén.', false);
        return;
    }
    try {
        const buscarBtn = document.getElementById('btnBuscarVale');
        buscarBtn.disabled = true;
        buscarBtn.textContent = 'Cargando...';
        const response = await fetch(`/api/almacen/id/${idAlmacen}`);
        buscarBtn.disabled = false;
        buscarBtn.textContent = 'Buscar';

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'ID de Almacén no encontrado.');
        }

        const data = await response.json();
        console.log('Datos del almacén obtenido:', data);

        const campos = [
            'idAlmacen', 'folio_vale_salida', 'solicito', 'producto', 'marca',
            'no_serie', 'no_parte', 'modelo', 'ctd_salidas', 'servicio',
            'uso_en', 'condicion'
        ];
        rellenarCampos(data.registro, campos, data.fechaHoy);

        showModal('Datos del almacén cargados correctamente.', true);
    } catch (error) {
        showModal(`Error al buscar el almacén: ${error.message}`, false);
    }
});

// Evento para guardar el vale
document.getElementById('btnGuardarVale').addEventListener('click', async function (event) {
    event.preventDefault();
    if (!this.checkValidity()) {
        event.stopPropagation();
        this.classList.add('was-validated');
        return;
    }

    const valeData = {
        idAlmacen: document.getElementById('idAlmacen').value.trim(),
        observacion: document.getElementById('observacion').value.trim(),
        entrego: document.getElementById('entrego').value.trim(),
        recibio: document.getElementById('recibio').value.trim(),
        fecha: document.getElementById('fecha').value.trim()
    };

    try {
        const btnGuardarVale = document.getElementById('btnGuardarVale');
        btnGuardarVale.disabled = true;
        btnGuardarVale.textContent = 'Guardando...';

        const response = await fetch('/api/almacen/vales/guardar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(valeData)
        });

        btnGuardarVale.disabled = false;
        btnGuardarVale.textContent = 'Guardar';

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensaje || 'Error al guardar el vale.');
        }

        showModal('¡Vale registrado correctamente!', true, true);
    } catch (error) {
        showModal(`Error al guardar el vale: ${error.message}`, false);
    }
});

// Función para mostrar el modal personalizado
function showModal(message, success, redirect = false) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? '¡Éxito!' : 'Error';
    modalTitle.className = success ? 'text-success' : 'text-danger';
    modalBody.textContent = message;

    modalButton.textContent = success ? 'Cerrar' : 'Intentar de nuevo';
    modalButton.className = success ? 'btn btn-primary' : 'btn btn-secondary';

    const modal = new bootstrap.Modal(document.getElementById('customModal'));

    modalButton.onclick = () => {
        modal.hide();
        if (success && redirect) {
            window.location.href = '/vistaAlmacen.html';
        }
    };

    modal.show();
}
