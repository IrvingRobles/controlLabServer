// Función auxiliar para rellenar campos 
function rellenarCampos(registro, campos) {
    campos.forEach(campo => {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = registro[campo] || '';
        }
    });
}

// Evento para buscar registro
document.getElementById('buscarRegistro').addEventListener('click', async () => {
    const idMov = document.getElementById('idMov').value.trim();
    if (!idMov) {
        showModal('Por favor, ingrese un ID Mov.', false);
        return;
    }
    try {
        const buscarBtn = document.getElementById('buscarRegistro');
        buscarBtn.disabled = true;
        buscarBtn.textContent = 'Cargando...';
        const response = await fetch(`/api/almacen/${idMov}`);
        buscarBtn.disabled = false;
        buscarBtn.textContent = 'Buscar Registro';
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Registro no encontrado.');
        }
        const data = await response.json();
        console.log('Datos del registro obtenido:', data);
        const campos = [
            'idUsuario', 'empresa', 'tipo_movimiento', 'fecha',
            'pedido', 'producto', 'marca', 'proveedor',
            'no_parte', 'no_serie', 'modelo', 'equipo'
        ];
        // Rellenamos los campos con los datos
        rellenarCampos(data.registro, campos);
        // Rellenar el campo de stock inicial (inicial)
        document.getElementById('inicial').value = data.registro.inicial || 0; // Si no hay valor, asigna 0

        showModal('Registro encontrado y cargado correctamente.', true);
    } catch (error) {
        showModal(`Error al buscar el registro: ${error.message}`, false);
    }
});

// Rellenar el campo de condicion al cargar la página
const condicionSelect = document.getElementById('condicion');
if (condicionSelect) {
    fetch('/api/almacen/condiciones/id')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            condicionSelect.innerHTML = '<option value="" selected disabled>Seleccione una condición</option>';
            data.forEach(condicion => {
                const option = document.createElement('option');
                option.value = condicion.idCondicion; // Guardamos el idMoneda como valor
                option.textContent = condicion.condiciones; // Mostramos el nombre de la moneda
                condicionSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener las condiciones:', error);
        });
}

// Validar el campo ctd_salidas para que no exceda el stock disponible
document.getElementById('ctd_salidas').addEventListener('input', () => {
    const ctdSalidasInput = document.getElementById('ctd_salidas');
    const stockDisponible = parseInt(document.getElementById('inicial').value, 10) || 0;
    const cantidadSalida = parseInt(ctdSalidasInput.value, 10) || 0;

    // Si la cantidad de salidas es mayor que el stock disponible, mostramos un mensaje de error
    if (cantidadSalida > stockDisponible) {
        showModal(`No puedes registrar más de ${stockDisponible} unidades.`, false);
        ctdSalidasInput.value = stockDisponible; // Ajustar automáticamente al máximo disponible
    }
});

// Evento para disparar el submit al hacer clic en el botón de guardar
document.getElementById('guardarRegistro').addEventListener('click', function () {
    document.getElementById('formRegistroAlmacen').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
});

// Evento para registrar salida
document.getElementById('formRegistroAlmacen').addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!this.checkValidity()) {
        event.stopPropagation();
        this.classList.add('was-validated');
        return;
    }
    const idMov = document.getElementById('idMov').value.trim();

    if (!idMov) {
        showModal('Por favor, ingrese un ID Mov antes de registrar la salida.', false);
        return;
    }

    const salidaData = {
        folio_vale_salida: document.getElementById('folio_vale_salida').value.trim(),
        ctd_salidas: document.getElementById('ctd_salidas').value.trim(),
        precio_salidas: document.getElementById('precio_salidas').value.trim(),
        solicito: document.getElementById('solicito').value.trim(),
        cliente: document.getElementById('cliente').value.trim(),
        servicio: document.getElementById('servicio').value.trim(),
        aplicacion: document.getElementById('aplicacion').value.trim(),
        uso_en: document.getElementById('uso_en').value.trim(),
        recibio: document.getElementById('recibio').value.trim(),
        condicion: document.getElementById('condicion').value.trim(),
    };

    try {
        // Obtener el botón de guardar fuera del formulario
        const guardarBtn = document.getElementById('guardarRegistro');
        guardarBtn.disabled = true;
        guardarBtn.textContent = 'Registrando...';

        const response = await fetch(`/api/almacen/${idMov}/salida`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(salidaData),
        });

        guardarBtn.disabled = false;
        guardarBtn.textContent = 'Guardar';

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.mensaje || 'Error al registrar la salida.');
        }

        // Dentro del bloque que maneja el éxito de registro
        showModal('¡Salida registrada correctamente! Puedes continuar con otro registro.', true, true);

    } catch (error) {
        showModal(`Error al registrar la salida: ${error.message}`, false);
    }
});

// Función para mostrar el modal personalizado
function showModal(message, success, redirect = false) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    // Configurar título, estilos y mensaje del modal
    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;

    // Configurar botón del modal
    modalButton.textContent = success ? "Cerrar" : "Intentar de nuevo";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    // Crear una instancia del modal
    const modal = new bootstrap.Modal(document.getElementById('customModal'));

    // Función para cerrar el modal
    modalButton.onclick = () => {
        modal.hide();  // Cierra el modal

        // Si es un mensaje de éxito y se debe redirigir
        if (success && redirect) {
            // Redirigir a la página del almacén general después de cerrar el modal
            window.location.href = '/vistaAlmacen.html';  // Aquí debes poner la URL de tu almacén general
        }
    };

    // Mostrar el modal
    modal.show();
}