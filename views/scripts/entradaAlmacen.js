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