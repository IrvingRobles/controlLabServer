document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarProveedores(); // Cargar proveedores al inicio
    setInterval(cargarProveedores, 10000); // Actualiza cada 10 segundos
});

const proveedorSelect = document.getElementById('idProveedor');
async function cargarProveedores() {
    try {
        const response = await fetch('/api/almacen/proveedorselect/id');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            // Guardar el valor seleccionado actualmente
            const selectedValue = proveedorSelect.value;

            // Limpiar el select
            proveedorSelect.innerHTML = '<option value="" disabled>Seleccione un proveedor</option>';

            // Agregar las nuevas opciones
            data.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.idProveedor;
                option.textContent = proveedor.nombre;
                proveedorSelect.appendChild(option);
            });

            // Restaurar la selección previa si sigue existiendo en la nueva lista
            if ([...proveedorSelect.options].some(opt => opt.value === selectedValue)) {
                proveedorSelect.value = selectedValue;
            }
        } else {
            console.error("No se recibieron proveedores válidos.");
        }
    } catch (error) {
        console.error('Error al obtener los proveedores:', error);
    }
}

document.getElementById('formRegistroProducto').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
        e.stopPropagation();
        return;
    }

    const data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        pedido: document.getElementById("pedido").value,
        marca: document.getElementById("marca").value,
        idProveedor: document.getElementById("idProveedor").value,
        no_parte: document.getElementById("no_parte").value,
        no_serie: document.getElementById("no_serie").value,
        modelo: document.getElementById("modelo").value,
        equipo: document.getElementById("equipo").value,
        inicial: document.getElementById("inicial").value,
        precio_inicial: document.getElementById("precio_inicial").value
    };

    try {
        const response = await fetch('/api/almacen/producto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al registrar el producto.');
        }

        showModal('¡Producto registrado correctamente!', true);
        document.getElementById('formRegistroProducto').reset();
        
        await cargarProductos();
        await cargarProveedores();
        
        // 🔥 NUEVO: Notificar a la ventana principal para actualizar el select
        window.parent.postMessage('actualizarProductos', '*');
        
        // Cerrar el modal después de 2 segundos (opcional)
        setTimeout(() => {
            window.parent.bootstrap.Modal.getInstance(window.parent.document.getElementById('modalProducto')).hide();
        }, 2000);

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
        document.getElementById("pedido").value = producto.pedido;
        document.getElementById("marca").value = producto.marca;
        document.getElementById("idProveedor").value = producto.idProveedor;
        document.getElementById("no_parte").value = producto.no_parte;
        document.getElementById("no_serie").value = producto.no_serie;
        document.getElementById("modelo").value = producto.modelo;
        document.getElementById("equipo").value = producto.equipo;
        document.getElementById("inicial").value = producto.inicial;
        document.getElementById("precio_inicial").value = producto.precio_inicial;

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
            document.getElementById("pedido").value = '';
            document.getElementById("marca").value = '';
            document.getElementById("idProveedor").value = '';
            document.getElementById("no_parte").value = '';
            document.getElementById("no_serie").value = '';
            document.getElementById("modelo").value = '';
            document.getElementById("equipo").value = '';
            document.getElementById("inicial").value = '';
            document.getElementById("precio_inicial").value = '';
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
                    <td>${producto.pedido}</td>
                    <td>${producto.marca}</td>
                    <td>${producto.idProveedor}</td>
                    <td>${producto.no_parte}</td>
                    <td>${producto.no_serie}</td>
                    <td>${producto.modelo}</td>
                    <td>${producto.equipo}</td>
                    <td>${producto.inicial}</td>
                    <td>${producto.precio_inicial}</td>
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

// Función idéntica a la que ya usas en adminEntradaAlmacen.js
function actualizarSelect(url, selectId, valorCampo = 'id', textoCampo = 'nombre') {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById(selectId);
            const selectedValue = select.value; // Guardamos la selección actual
            
            select.innerHTML = `<option value="" selected disabled>Seleccione...</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valorCampo];
                option.textContent = item[textoCampo] || item.codigo;
                select.appendChild(option);
            });
            
            // Restaurar selección si existe en las nuevas opciones
            if (selectedValue && [...select.options].some(opt => opt.value == selectedValue)) {
                select.value = selectedValue;
            }
        });
} 

// Escucha de mensajes (igual que en adminEntradaAlmacen)
window.addEventListener('message', (event) => {
    switch (event.data) {
        case 'actualizarProveedores':
            actualizarSelect('/api/almacen/proveedorselect/id', 'idProveedor', 'idProveedor', 'nombre');
            break;
        // Mantén tus otros casos aquí...
    }
});

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
            producto.pedido,
            producto.marca,
            producto.idProveedor,
            producto.no_parte,
            producto.no_serie,
            producto.modelo,
            producto.equipo,
            producto.inicial,
            producto.precio_inicial
        ]);

        // Crear la tabla en el PDF
        doc.autoTable({
            startY: 30,
            head: [["ID", "Nombre", "Descripción", "Pedido", "Marca", "Proveedor", "N° Parte", "N° Serie", "Modelo", "Equipo", "Inicial", "Precio"]],
            body: datosTabla,
            theme: "striped",
        });

        // Guardar el PDF
        doc.save("Catalogo_Productos.pdf");

    } catch (error) {
        alert(`Error al generar el PDF: ${error.message}`);
    }
}