document.addEventListener("DOMContentLoaded", function () {
    // Variables para productos (ahora accesible globalmente)
    window.productosSeleccionados = [];

    // Configuración de fetch con credenciales
    const fetchConfig = {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    };
// En la parte donde obtienes el usuario actual:
fetch('/api/almacen/user/actual', fetchConfig)
.then(response => response.json())
.then(user => {
    document.getElementById('usernameDisplay').value = user.username; // Muestra el username
    document.getElementById('idUsuario').value = user.id; // Guarda el ID oculto
})
    // Obtener usuario actual
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login.html';
    });

    // Rellenar productos
    const productoselect = document.getElementById('idProductos');
    if (productoselect) {
        fetch('/api/almacen/productoselect/id')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                productoselect.innerHTML = '<option value="" selected disabled>Seleccione un producto</option>';
                data.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        id: producto.idProducto,
                        nombre: producto.nombre
                    });
                    option.textContent = producto.nombre;
                    productoselect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al obtener productos:', error));
    }

    // Rellenar OT
    const otSelect = document.getElementById('idOt');
    if (otSelect) {
        fetch('/api/almacen/ot/id')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                otSelect.innerHTML = '<option value="" selected disabled>Seleccione una OT</option>';
                data.forEach(ot => {
                    const option = document.createElement('option');
                    option.value = ot.id;
                    option.textContent = ot.clave;
                    otSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al obtener OTs:', error));
    }

    // Manejar clic en botón Agregar
    document.getElementById('btnAgregarProducto').addEventListener('click', function(e) {
        e.preventDefault();
        
        const select = document.getElementById('idProductos');
        const unidades = document.getElementById('unidades').value;
        
        if (select.value && unidades > 0) {
            const producto = JSON.parse(select.value);
            window.productosSeleccionados.push({
                id: producto.id,
                nombre: producto.nombre,
                unidades: unidades
            });
            actualizarListaProductos();
            
            // Limpiar selección
            select.value = "";
            document.getElementById('unidades').value = 1;
        }
    });

    // Manejar envío del formulario
    document.getElementById('formSolicitud').addEventListener('submit', async function (e) {
        e.preventDefault();

        if (window.productosSeleccionados.length === 0 && !document.getElementById('nota').value.trim()) {
            showModal('Debe agregar al menos un producto o escribir una nota', false);
            return;
        }

        const solicitudData = {
            idUsuario: document.getElementById('idUsuario').value,
            idOt: document.getElementById('idOt').value || null,
            idProductos: window.productosSeleccionados.length > 0 ? window.productosSeleccionados[0].id : null,
            fecha: document.getElementById('fecha').value || new Date().toISOString().split('T')[0],
            unidades: document.getElementById('unidades').value,
            nota: document.getElementById('nota').value.trim() || null,
            productos: JSON.stringify(window.productosSeleccionados)
        };

        try {
            const response = await fetch('/api/almacen/solicitudes/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(solicitudData)
            });

            if (!response.ok) throw new Error(await response.text());

            const result = await response.json();
            showModal(`Solicitud registrada con ID: ${result.idSoli}`, true);
            this.reset();
            window.productosSeleccionados = [];
            actualizarListaProductos();
        } catch (error) {
            console.error('Error al registrar:', error);
            showModal('Error al registrar la solicitud: ' + error.message, false);
        }
    });

    // Función para actualizar lista visual
    function actualizarListaProductos() {
        const listaProductos = document.getElementById('listaProductos');
        listaProductos.innerHTML = '';
        
        if (window.productosSeleccionados.length === 0) return;
        
        const table = document.createElement('table');
        table.className = 'table table-bordered table-sm';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Unidades</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        window.productosSeleccionados.forEach((producto, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-id="${producto.id}">${producto.nombre}</td>
                <td>${producto.unidades}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // Agregar event listeners a los botones de eliminar
        table.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                eliminarProducto(index);
            });
        });
        
        listaProductos.appendChild(table);
    }
});

// Función para eliminar productos
function eliminarProducto(index) {
    // Eliminar el producto del array global
    window.productosSeleccionados.splice(index, 1);
    
    // Volver a renderizar la lista
    const actualizarListaProductos = document.getElementById('listaProductos').innerHTML = '';
    
    if (window.productosSeleccionados.length === 0) return;
    
    const table = document.createElement('table');
    table.className = 'table table-bordered table-sm';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Producto</th>
                <th>Unidades</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    window.productosSeleccionados.forEach((producto, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-id="${producto.id}">${producto.nombre}</td>
            <td>${producto.unidades}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Agregar event listeners a los nuevos botones de eliminar
    table.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            eliminarProducto(index);
        });
    });
    
    document.getElementById('listaProductos').appendChild(table);
}

// Función showModal (sin cambios)
function showModal(message, success) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalButton = document.getElementById('modalButton');

    modalTitle.textContent = success ? "¡Éxito!" : "Error";
    modalTitle.className = success ? "text-success" : "text-danger";
    modalBody.textContent = message;

    modalButton.textContent = success ? "Ir a Menu" : "Cerrar";
    modalButton.className = success ? "btn btn-primary" : "btn btn-secondary";

    const modal = new bootstrap.Modal(document.getElementById('customModal'));
    modal.show();

    if (success) {
        modalButton.onclick = () => window.location.href = '/index1.html';
    }
}