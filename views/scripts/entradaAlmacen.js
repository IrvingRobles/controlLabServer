document.addEventListener("DOMContentLoaded", function () {
    const idAlmacenField = document.getElementById('idAlmacen');
    if (idAlmacenField) {
        // Solicita el siguiente ID al servidor
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
                    idAlmacenField.value = data.siguiente_id; // Rellena el campo
                } else {
                    console.error('No se recibió un siguiente_id válido.');
                }
            })
            .catch(error => {
                console.error('Error al obtener el siguiente ID:', error);
            });
    }

    document.getElementById('formRegistroAlmacen').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Verifica si el formulario es válido
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

    if (success) {
        modalButton.onclick = () => {
            window.location.href = '/vistaAlmacen.html';
        };
    } else {
        modalButton.onclick = null; // Solo cierra el modal
    }

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}