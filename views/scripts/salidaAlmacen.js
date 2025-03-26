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
    const idAlmacen = document.getElementById('idAlmacen').value.trim();
    if (!idAlmacen) {
        showModal('Por favor, ingrese un ID Mov.', false);
        return;
    }
    try {
        const buscarBtn = document.getElementById('buscarRegistro');
        buscarBtn.disabled = true;
        buscarBtn.textContent = 'Cargando...';
        const response = await fetch(`/api/almacen/${idAlmacen}`);
        buscarBtn.disabled = false;
        buscarBtn.textContent = 'Buscar Registro';
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensaje || 'Registro no encontrado.');
        }
        const data = await response.json();
        console.log('Datos del registro obtenido:', data);
        const campos = [
            'idUsuario',
            'idEmpresa',
            'idMovimiento',
            'fecha',
            'pedido',       // 🔹 Pedido del producto
            'idProducto',
            'marca',        // 🔹 Marca del producto
            'idProveedor',    // 🔹 Proveedor del producto
            'no_parte',     // 🔹 Número de parte
            'no_serie',     // 🔹 Número de serie
            'modelo',       // 🔹 Modelo del producto
            'equipo'        // 🔹 Equipo relacionado
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

// Rellenar el campo de monedas al cargar la página
const userSelect = document.getElementById('solicito');
if (userSelect) {
    fetch('/api/almacen/x/user')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            userSelect.innerHTML = '<option value="" selected disabled>Seleccione un Usuario</option>';
            data.forEach(users => {
                const option = document.createElement('option');
                option.value = users.id; // Guardamos el idMoneda como valor
                option.textContent = users.username; // Mostramos el nombre de la moneda
                userSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener los usuarios:', error);
        });
}

// Rellenar el campo de monedas al cargar la página
const userSelect1 = document.getElementById('recibio');
if (userSelect1) {
    fetch('/api/almacen/x/user')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            userSelect1.innerHTML = '<option value="" selected disabled>Seleccione un Usuario</option>';
            data.forEach(users => {
                const option = document.createElement('option');
                option.value = users.id; // Guardamos el idMoneda como valor
                option.textContent = users.username; // Mostramos el nombre de la moneda
                userSelect1.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener los usuarios:', error);
        });
}

// Rellenar el campo de monedas al cargar la página
const otSelect = document.getElementById('servicio');
if (otSelect) {
    fetch('/api/almacen/ot/id')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);

            }
            return response.json();
        })
        .then(data => {
            otSelect.innerHTML = '<option value="" selected disabled>Seleccione una OT</option>';
            data.forEach(registros => {
                const option = document.createElement('option');
                option.value = registros.id; // Guardamos el idMoneda como valor
                option.textContent = registros.clave; // Mostramos el nombre de la moneda
                otSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener las OT:', error);
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
document.getElementById('formRegistroAlmacen').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const idAlmacen = document.getElementById('idAlmacen').value.trim();
        if (!idAlmacen) throw new Error('ID de almacén requerido');

        const datos = {
            folio_vale_salida: document.getElementById('folio_vale_salida').value.trim(),
            ctd_salidas: document.getElementById('ctd_salidas').value.trim(),
            precio_salidas: document.getElementById('precio_salidas').value.trim(),
            solicito: document.getElementById('solicito').value,
            servicio: document.getElementById('servicio').value,
            aplicacion: document.getElementById('aplicacion').value.trim(),
            uso_en: document.getElementById('uso_en').value.trim(),
            recibio: document.getElementById('recibio').value,
            condicion: document.getElementById('condicion').value
        };

        const guardarBtn = document.getElementById('guardarRegistro');
        guardarBtn.disabled = true;
        guardarBtn.textContent = 'Guardando...';

        const response = await fetch(`/api/almacen/${idAlmacen}/salida`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.mensaje || 'Error al guardar');

        showModal('Salida registrada!', true, true);
    } catch (error) {
        showModal(error.message, false);
    } finally {
        const guardarBtn = document.getElementById('guardarRegistro');
        if (guardarBtn) {
            guardarBtn.disabled = false;
            guardarBtn.textContent = 'Guardar';
        }
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
            window.location.href = '/adminVistaAlmacen.html';  // Aquí debes poner la URL de tu almacén general
        }
    };

    // Mostrar el modal
    modal.show();
}