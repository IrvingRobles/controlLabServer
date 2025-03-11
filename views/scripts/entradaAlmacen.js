document.addEventListener("DOMContentLoaded", function () {
    // Rellenar el campo de tipo de movimiento al cargar la página
    const movimientoSelect = document.getElementById('idMovimiento');
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

    const productoselect = document.getElementById('idProducto');
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

    const empresaSelect = document.getElementById('idEmpresa');
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
    const monedaSelect = document.getElementById('idMoneda');
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

    document.getElementById('idProducto').addEventListener('change', async function () {
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
    
        // Calcular nuevo inicial y precio_inicial
        document.getElementById('inicial').value = inicial + ctd_entradas;
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
            idEmpresa: document.getElementById("idEmpresa").value,
            idMovimiento: document.getElementById("idMovimiento").value,
            fecha: document.getElementById("fecha").value,
            idProducto: document.getElementById("idProducto").value,
            factura: document.getElementById("factura").value,
            idMoneda: document.getElementById("idMoneda").value,
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

document.getElementById('editarRegistro').addEventListener('click', async function () {
    const idAlmacen = document.getElementById("id").value;
    
    if (!idAlmacen) {
        showModal("Por favor, busca un registro antes de editar.", false);
        return;
    }

    const data = {
        idAlmacen,
        idUsuario: document.getElementById("idUsuario").value,
        idEmpresa: document.getElementById("idEmpresa").value,
        idMovimiento: document.getElementById("idMovimiento").value,
        fecha: document.getElementById("fecha").value,
        idProducto: document.getElementById("idProducto").value,
        factura: document.getElementById("factura").value,
        idMoneda: document.getElementById("idMoneda").value,
        ctd_entradas: document.getElementById("ctd_entradas").value,
        pu_entrada: document.getElementById("pu_entrada").value,
        concepto: document.getElementById("concepto").value,
        anaquel: document.getElementById("anaquel").value,
        seccion: document.getElementById("seccion").value,
        caja: document.getElementById("caja").value,
        observaciones: document.getElementById("observaciones").value
    };

    try {
        const response = await fetch(`/api/almacen/editar/${idAlmacen}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            showModal(`Error: ${error.message}`, false);
        } else {
            showModal("Registro editado correctamente.", true);
        }
    } catch (error) {
        showModal("Hubo un problema al editar el registro.", false);
    }
});


// Función para obtener el parámetro 'id' de la URL
function obtenerIdDesdeUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Al cargar la página, obtener el id de la URL y rellenar el campo
document.addEventListener("DOMContentLoaded", function() {
    const id = obtenerIdDesdeUrl();
    if (id) {
        // Si encontramos un id, lo insertamos en el campo de ID
        document.getElementById("id").value = id;
        // También puedes llamar a la función de búsqueda aquí si quieres que se realice automáticamente
        buscarRegistro();
    }
});

async function buscarRegistro() {
    const id = document.getElementById('id').value.trim(); // Usamos el valor del campo 'id' para la búsqueda
    if (!id) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/entrada/id/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener el registro.');
        }
        const entrada = await response.json();

        // Formatear la fecha antes de asignarla al campo de fecha
        if (entrada.fecha) {
            let fechaFormateada = new Date(entrada.fecha).toLocaleDateString('en-CA'); // Formato yyyy-MM-dd
            document.getElementById("fecha").value = fechaFormateada;
        } else {
            console.log('Fecha no válida');
        }

        // Asignar los demás campos como estaba antes
        document.getElementById("idUsuario").value = entrada.idUsuario;
        document.getElementById("idEmpresa").value = entrada.idEmpresa;
        document.getElementById("idMovimiento").value = entrada.idMovimiento;
        document.getElementById("idProducto").value = entrada.idProducto;
        document.getElementById("factura").value = entrada.factura;
        document.getElementById("idMoneda").value = entrada.idMoneda;
        document.getElementById("inicial").value = entrada.inicial;
        document.getElementById("precio_inicial").value = entrada.precio_inicial;
        document.getElementById("ctd_entradas").value = entrada.ctd_entradas;
        document.getElementById("pu_entrada").value = entrada.pu_entrada;
        document.getElementById("concepto").value = entrada.concepto;
        document.getElementById("anaquel").value = entrada.anaquel;
        document.getElementById("seccion").value = entrada.seccion;
        document.getElementById("caja").value = entrada.caja;
        document.getElementById("observaciones").value = entrada.observaciones;

        document.getElementById("idAlmacen").value = "";
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

document.getElementById('eliminarRegistro').addEventListener('click', function () {
    const id = document.getElementById('id').value;
    eliminarRegistro(id);
});

async function eliminarRegistro(id) {
    if (!id) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }

    try {
        const checkResponse = await fetch(`/api/almacen/entrada/id/${id}`);
        if (!checkResponse.ok) {
            showModal('El registro no existe o ya fue eliminado.', false);
            return;
        }

        showModal('¿Estás seguro de que deseas eliminar este registro?', true);

        const modalButton = document.getElementById('modalButton');
        modalButton.textContent = "Eliminar";
        modalButton.className = "btn btn-danger";

        modalButton.onclick = async () => {
            try {
                const response = await fetch(`/api/almacen/entrada/${id}`, { method: 'DELETE' });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar el registro.');
                }

                showModal('Registro eliminado correctamente.', true);

                // Limpiar los campos del formulario
                document.getElementById("id").value = '';
                document.getElementById("idAlmacen").value = '';
                document.getElementById("idUsuario").value = '';
                document.getElementById("idEmpresa").value = '';
                document.getElementById("idMovimiento").value = '';
                document.getElementById("fecha").value = '';
                document.getElementById("idProducto").value = '';
                document.getElementById("factura").value = '';
                document.getElementById("idMoneda").value = '';
                document.getElementById("inicial").value = '';
                document.getElementById("precio_inicial").value = '';
                document.getElementById("ctd_entradas").value = '';
                document.getElementById("pu_entrada").value = '';
                document.getElementById("concepto").value = '';
                document.getElementById("anaquel").value = '';
                document.getElementById("seccion").value = '';
                document.getElementById("caja").value = '';
                document.getElementById("observaciones").value = '';

            } catch (error) {
                showModal(`Error: ${error.message}`, false);
            }
        };

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

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

    // Si es un mensaje de error, el botón no redirige
    modalButton.onclick = success
        ? () => { window.location.href = '/vistaAlmacen.html'; }
        : () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('customModal'));
            modal.hide();  // Cerrar el modal manualmente si es un error
        };

    // Crear el modal y mostrarlo
    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}