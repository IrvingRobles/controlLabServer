document.getElementById('formRegistroMoneda').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreMoneda = document.getElementById('nombreMoneda').value.trim();
    const codigoMoneda = document.getElementById('codigoMoneda').value.trim();

    if (!nombreMoneda || !codigoMoneda) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/monedas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombreMoneda, codigoMoneda }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la moneda.');
        }

        showModal('¡Moneda registrada correctamente!', true);
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

// Función para mostrar el modal personalizado
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');
    const modalElement = document.getElementById('customModal');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;
    modalButton.textContent = "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    // Eliminar eventos previos para evitar acumulación
    modalButton.replaceWith(modalButton.cloneNode(true));
    const newModalButton = document.getElementById('modalButton');

    newModalButton.addEventListener('click', () => {
        if (success) {
            window.location.href = '/vistaAlmacen.html'; // Redirige en caso de éxito
        }
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide(); // Cierra el modal
    });

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
