document.addEventListener("DOMContentLoaded", function () {
    // Rellenar el campo de movimiento al cargar la página
    const movimientoSelect = document.getElementById('tipo_movimiento');
    if (movimientoSelect) {
        fetch('/api/almacen/movimientos')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                movimientoSelect.innerHTML = '<option value="" selected disabled>Seleccione un movimiento</option>';
                data.forEach(movimiento => {
                    const option = document.createElement('option');
                    option.value = movimiento.movimiento;
                    option.textContent = movimiento.movimiento;
                    movimientoSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al obtener los movimientos:', error);
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
                    option.value = moneda.codigo;
                    option.textContent = moneda.codigo;
                    monedaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al obtener las monedas:', error);
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
            codigo: document.getElementById("codigo").value,
            movimiento: document.getElementById("tipo_movimiento").value,
            fecha: document.getElementById("fecha").value,
            pedido: document.getElementById("pedido").value,
            producto: document.getElementById("producto").value,
            marca: document.getElementById("marca").value,
            proveedor: document.getElementById("proveedor").value,
            no_parte: document.getElementById("no_parte").value,
            no_serie: document.getElementById("no_serie").value,
            modelo: document.getElementById("modelo").value,
            equipo: document.getElementById("equipo").value,
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
                document.getElementById('idAlmacen').value = result.siguiente_id;
                showModal(`Registrado con éxito Id Mov: ${result.siguiente_id}`, true);
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
