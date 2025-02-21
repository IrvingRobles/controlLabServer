document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

document.getElementById('formRegistroProducto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre || !descripcion) {
        showModal('Todos los campos son obligatorios.', false);
        return;
    }

    try {
        const response = await fetch('/api/almacen/producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar el producto.');
        }

        showModal('¡Producto registrado correctamente!', true);
        cargarProductos(); // Recargar la lista de productos

    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
});

async function buscarProducto() {
    const idProducto = document.getElementById('idProducto').value.trim();
    if (!idProducto) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }
    try {
        const response = await fetch(`/api/almacen/producto/id/${idProducto}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener el producto.');
        }
        const producto = await response.json();
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
    } catch (error) {
        showModal(`Error: ${error.message}`, false);
    }
}

async function eliminarProducto(id) {
    if (!id) {
        showModal('Por favor, ingresa un ID válido.', false);
        return;
    }

    showModal('¿Estás seguro de que deseas eliminar este producto?', true);

    const modalButton = document.getElementById('modalButton');
    modalButton.textContent = "Eliminar";
    modalButton.className = "btn btn-danger";
    modalButton.onclick = async () => {
        try {
            const response = await fetch(`/api/almacen/producto/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el producto.');
            }
            showModal('Producto eliminado correctamente.', true);
            document.getElementById('idProducto').value = '';
            document.getElementById('nombre').value = '';
            document.getElementById('descripcion').value = '';
            cargarProductos(); // Recargar lista
        } catch (error) {
            showModal(`Error: ${error.message}`, false);
        }
    };
}

async function cargarProductos() {
    try {
        const response = await fetch('/api/almacen/productos/id');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const productos = await response.json();

        if (Array.isArray(productos) && productos.length > 0) {
            const listaProductos = document.getElementById('listaProductos');
            listaProductos.innerHTML = ''; // Limpiar tabla

            productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.idProducto}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion}</td>
                `;
                listaProductos.appendChild(fila);
            });
        } else {
            console.error("No se encontraron productos en la estructura esperada.");
        }

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para mostrar el modal personalizado
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message; 
    modalButton.textContent = "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    modalButton.onclick = () => {
        if (success) {
            document.getElementById('formRegistroProducto').reset();
            cargarProductos();
        }
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('customModal'));
        modalInstance.hide();
    };

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();
}

// Función para generar el PDF del catálogo de productos
async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Obtener la fecha actual
    const fechaActual = new Date().toLocaleDateString();

    // Título del documento
    doc.setFontSize(18);
    doc.text("Catálogo de Productos", 105, 15, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Fecha: ${fechaActual}`, 15, 25);

    // Obtener la tabla de productos
    try {
        const response = await fetch('/api/almacen/productos/id');
        if (!response.ok) throw new Error("No se pudieron cargar los productos.");

        const productos = await response.json();
        if (!Array.isArray(productos) || productos.length === 0) {
            alert("No hay productos para generar el PDF.");
            return;
        }

        // Convertir los productos en un formato adecuado para autoTable
        const datosTabla = productos.map((producto) => [
            producto.idProducto,
            producto.nombre,
            producto.descripcion,
        ]);

        // Crear la tabla en el PDF
        doc.autoTable({
            startY: 30,
            head: [["ID", "Nombre", "Descripción"]],
            body: datosTabla,
            theme: "striped",
        });

        // Guardar el PDF
        doc.save("Catalogo_Productos.pdf");

    } catch (error) {
        alert(`Error al generar el PDF: ${error.message}`);
    }
}