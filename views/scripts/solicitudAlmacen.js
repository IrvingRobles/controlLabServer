
document.addEventListener("DOMContentLoaded", function () {
    // Configuración de fetch con credenciales
    const fetchConfig = {
        method: 'GET',
        credentials: 'include', // Permite enviar cookies en la petición
        headers: { 'Content-Type': 'application/json' }
    };

    // Obtener usuario actual y mostrarlo en pantalla
    fetch('/api/almacen/user/actual', fetchConfig)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error de autenticación');
        }
        return response.json();
    })
    .then(user => {
        const idUsuarioInput = document.getElementById('idUsuario');

        if (idUsuarioInput) {
            idUsuarioInput.value = user.username; // Mostrar el nombre de usuario
            idUsuarioInput.dataset.id = user.id; // Guardar el ID en un atributo 'data-id'
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login.html'; // Redirigir al login si hay error
    });

    // Rellenar el campo de productos al cargar la página
    const productoselect = document.getElementById('idProductos');
    if (productoselect) {
        fetch('/api/almacen/productoselect/id')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                productoselect.innerHTML = '<option value="" selected disabled>Seleccione un producto</option>';
                data.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.idProducto;
                    option.textContent = producto.nombre;
                    productoselect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al obtener productos:', error));
    }

    // Rellenar el campo de OT (si es necesario)
    const otSelect = document.getElementById('idOt');
    if (otSelect) {
        fetch('/api/almacen/ot/id')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                otSelect.innerHTML = '<option value="" selected disabled>Seleccione una OT</option>';
                data.forEach(ot => {
                    const option = document.createElement('option');
                    option.value = ot.id;
                    option.textContent = ot.clave;
                    otSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al obtener OTs:', error));
    }

    // Manejar el envío del formulario (NOMBRES IGUALES a tu controller)
    document.getElementById('formSolicitud').addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validación como en tu controller: producto O nota
        if (!document.getElementById('idProductos').value && !document.getElementById('nota').value.trim()) {
            showModal('⚠️ Debe seleccionar un producto o escribir una nota', false);
            return;
        }

        const solicitudData = {
            idUsuario: document.getElementById('idUsuario').value, // Exactamente igual
            idOt: document.getElementById('idOt').value || null,  // Exactamente igual
            idProductos: document.getElementById('idProductos').value || null, // Exactamente igual
            fecha: document.getElementById('fecha').value || new Date().toISOString().split('T')[0],
            unidades: document.getElementById('unidades').value,
            nota: document.getElementById('nota').value.trim() || null // Exactamente igual
        };

        try {
            const response = await fetch('/api/almacen/solicitudes/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(solicitudData)
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();
            showModal(`✅ Solicitud registrada con ID: ${result.idSoli}`, true);
            this.reset();

        } catch (error) {
            console.error('Error al registrar:', error);
            showModal('❌ Error al registrar la solicitud', false);
        }
    });
}); 

// Función showModal (COPIADA DE TU EJEMPLO SIN CAMBIOS)
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;

    modalButton.textContent = success ? "Ir a Solicitudes" : "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();

    if (success) {
        modalButton.onclick = () => window.location.href = '/solicitudes.html';
    }
}