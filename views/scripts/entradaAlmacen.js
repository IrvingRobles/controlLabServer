document.addEventListener("DOMContentLoaded", function () {
    // Rellenar el campo de tipo de movimiento al cargar la página
    const movimientoSelect = document.getElementById('tipo_movimiento');
    if (movimientoSelect) {
        fetch('/api/almacen/id/movimientos') // Asegúrate de que esta ruta es la correcta
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    movimientoSelect.innerHTML = '<option value="" selected disabled>Seleccione un movimiento</option>';
                    data.forEach(movimiento => {
                        const option = document.createElement('option');
                        option.value = movimiento.idMovimiento;
                        option.textContent = movimiento.nombre;
                        movimientoSelect.appendChild(option);
                    });
                } else {
                    console.error("No se recibieron movimientos válidos");
                }
            })
            .catch(error => {
                console.error('Error al obtener los movimientos:', error);
            });
    }



    const productoselect = document.getElementById('producto');
    if (productoselect) {
        fetch('/api/almacen/productoselect/id') // Asegúrate de que esta ruta es la correcta
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    productoselect.innerHTML = '<option value="" selected disabled>Seleccione un producto</option>';
                    data.forEach(producto => {
                        const option = document.createElement('option');
                        option.value = producto.idProducto;
                        option.textContent = producto.nombre;
                        productoselect.appendChild(option);
                    });
                } else {
                    console.error("No se recibieron productos válidos");
                }
            })
            .catch(error => {
                console.error('Error al obtener los productos:', error);
            });
    }

    const empresaSelect = document.getElementById('empresa');
    if (empresaSelect) {
        fetch('/api/almacen/id/empresas') // Ajusta la ruta si es diferente
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                empresaSelect.innerHTML = '<option value="" selected disabled>Seleccione una empresa</option>';
                data.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.idEmpresa; // Se guarda el ID
                    option.textContent = empresa.codigo; // Se muestra el código
                    empresaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al obtener las empresas:', error);
            });
    }

    // Rellenar el campo de monedas al cargar la página
    const monedaSelect = document.getElementById('moneda');
    if (monedaSelect) {
        fetch('/api/almacen/moneda')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                monedaSelect.innerHTML = '<option value="" selected disabled>Seleccione una moneda</option>';
                data.forEach(moneda => {
                    const option = document.createElement('option');
                    option.value = moneda.idMoneda; // Guardamos el idMoneda como valor
                    option.textContent = moneda.codigo; // Mostramos el nombre de la moneda
                    monedaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al obtener las monedas:', error);
            });
    }

    document.getElementById('producto').addEventListener('change', async function () {
        const idProducto = this.value;

        if (!idProducto) return;

        try {
            const response = await fetch(`/api/almacen/producto/${idProducto}`);
            if (!response.ok) throw new Error('Producto no encontrado');

            const data = await response.json();
            console.log('Datos recibidos:', data); // Verifica qué datos llegan en consola

            document.getElementById('inicial').value = data.inicial ?? 0;
            document.getElementById('precio_inicial').value = data.precio_inicial ?? 0;
        } catch (error) {
            console.error('Error al obtener datos del producto:', error);
            alert('Error al cargar los datos del producto.');
        }
    });

    // Rellenar el campo de monedas al cargar la página
    const userSelect = document.getElementById('idUsuario');
    if (userSelect) {
        fetch('/api/almacen/user')
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

    // Obtener el siguiente ID del almacén
    const idAlmacenField = document.getElementById('idAlmacen');
    if (idAlmacenField) {
        fetch('/api/almacen/siguiente-id', { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos del servidor:', data);
                if (data.siguiente_id) {
                    idAlmacenField.value = data.siguiente_id;
                } else {
                    console.error('No se recibió un siguiente_id válido.');
                }
            })
            .catch(error => {
                console.error('Error al obtener el siguiente ID:', error);
            });
    }

    // Manejar el botón de guardar
    document.getElementById('guardarRegistro').addEventListener('click', function () {
        // Obtener valores actuales
        const inicial = parseFloat(document.getElementById('inicial').value) || 0;
        const ctd_entradas = parseFloat(document.getElementById('ctd_entradas').value) || 0;
        const pu_entrada = parseFloat(document.getElementById('pu_entrada').value) || 0;
    
        // Calcular nuevo inicial y precio_inicial
        document.getElementById('inicial').value = inicial + ctd_entradas;
        document.getElementById('precio_inicial').value = pu_entrada;
    
        // Enviar el formulario (una sola vez)
        document.getElementById('formRegistroAlmacen').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    document.getElementById('guardarRegistro').addEventListener('click', function () {
        // Aquí disparas el evento submit directamente en el formulario
        document.getElementById('formRegistroAlmacen').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Manejar el envío del formulario
    document.getElementById('formRegistroAlmacen').addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!this.checkValidity()) {
            event.stopPropagation();
            this.classList.add('was-validated');
            return;
        }

        const data = {
            idUsuario: document.getElementById("idUsuario").value,
            empresa: document.getElementById("empresa").value,
            tipo_movimiento: document.getElementById("tipo_movimiento").value,
            fecha: document.getElementById("fecha").value,
            producto: document.getElementById("producto").value,
            factura: document.getElementById("factura").value,
            moneda: document.getElementById("moneda").value,
            inicial: document.getElementById("inicial").value,
            precio_inicial: document.getElementById("precio_inicial").value,
            ctd_entradas: document.getElementById("ctd_entradas").value,
            pu_entrada: document.getElementById("pu_entrada").value,
            concepto: document.getElementById("concepto").value,
            anaquel: document.getElementById("anaquel").value,
            seccion: document.getElementById("seccion").value,
            caja: document.getElementById("caja").value,
            observaciones: document.getElementById("observaciones").value
        };

        try {
            const response = await fetch('/api/almacen/entrada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                showModal(`Error: ${error.mensaje}`, false);
            } else {
                const result = await response.json();
                document.getElementById('idAlmacen').value = result.registroId;
                showModal(`Registrado con éxito Id Mov: ${result.registroId}`, true);

            }
        } catch (error) {
            showModal("Hubo un problema al procesar la solicitud. Inténtalo de nuevo.", false);
        }
    });
});

// Función para mostrar el modal personalizado
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.classList = success ? "text-success" : "text-danger";
    modalBody.textContent = message;

    modalButton.textContent = success ? "Ir al Almacén General" : "Cerrar";
    modalButton.classList = success ? "btn btn-primary" : "btn btn-secondary";

    modalButton.onclick = success
        ? () => { window.location.href = '/vistaAlmacen.html'; }
        : null;

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}