document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const contenedorSolicitudes = document.getElementById('contenedorSolicitudes');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroIdOt = document.getElementById('filtroIdOt');
    const hideCompletedCheckbox = document.getElementById('hideCompleted');

    // Ocultamos el filtro de usuario ya que solo verá los suyos
    document.getElementById('filtroIdUsuario').parentElement.style.display = 'none';
    
    let solicitudes = [];
    const usuarioActual = JSON.parse(localStorage.getItem('user'));

    // Verificar si hay usuario logueado
    if (!usuarioActual) {
        window.location.href = "login.html";
        return;
    }

    // Cargar solicitudes al iniciar
    cargarSolicitudes();

    // Event listeners
    btnFiltrar.addEventListener('click', filtrarSolicitudes);
    btnLimpiar.addEventListener('click', limpiarFiltros);
    hideCompletedCheckbox.addEventListener('change', filtrarSolicitudes);

    // Función para mostrar modal simple
    function showModal(title, message, isSuccess) {
        const modal = new bootstrap.Modal(document.getElementById('customModal'));
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = `<p>${message}</p>`;
        const modalButton = document.getElementById('modalButton');
        
        modalButton.className = isSuccess ? 'btn btn-success' : 'btn btn-danger';
        modalButton.textContent = 'Aceptar';
        
        modal.show();
    }

    // Función para cargar las solicitudes del usuario actual
    async function cargarSolicitudes() {
        try {
            const response = await fetch(`/api/almacen/solicitudes/usuario/${usuarioActual.id}`);
            
            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es JSON válido');
            }
    
            const data = await response.json();
            
            // Debug: Ver respuesta completa
            console.log('Respuesta completa del servidor:', data);
    
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
    
            if (!data || !data.success) {
                throw new Error(data.message || 'Respuesta inválida del servidor');
            }
    
            // Validar y transformar datos
            solicitudes = Array.isArray(data.data) ? data.data.map(s => ({
                ...s,
                productos: Array.isArray(s.productos) ? s.productos : [],
                ot: s.ot || { id: null, clave: 'N/A' },
                nota: s.nota || 'Sin nota',
                estado: s.estado || 'pendiente'
            })) : [];
            
            filtrarSolicitudes();
            
        } catch (error) {
            console.error('Error en cargarSolicitudes:', error);
            showModal('Error', error.message || 'Error al cargar solicitudes', false);
            
            solicitudes = [];
            mostrarSolicitudes([]);
        }
    }

    // Función para mostrar las solicitudes en tarjetas (simplificada)
    function mostrarSolicitudes(solicitudesMostrar) {
        contenedorSolicitudes.innerHTML = '';

        if (solicitudesMostrar.length === 0) {
            contenedorSolicitudes.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">No hay solicitudes que coincidan con los filtros</div>
                </div>
            `;
            return;
        }

        solicitudesMostrar.forEach(solicitud => {
            const fechaFormateada = formatearFecha(solicitud.fecha);
            const productosHTML = generarListaProductos(solicitud.productos);

            const tarjeta = document.createElement('div');
            tarjeta.className = 'col';
            tarjeta.innerHTML = `
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="badge bg-${solicitud.estado === 'pendiente' ? 'warning' : 'success'}">
                            ${solicitud.estado}
                        </span>
                        <small class="text-muted">${fechaFormateada}</small>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Solicitud #${solicitud.idSoli}</h5>
                        <div class="mb-3">
                            <p class="mb-1"><strong>OT:</strong> ${solicitud.ot?.clave || 'N/A'}</p>
                            <p class="mb-1"><strong>Nota:</strong> ${solicitud.nota || 'Sin nota'}</p>
                        </div>
                        <div class="productos-container mb-3">
                            <h6>Productos:</h6>
                            ${productosHTML}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <small class="text-muted">Estado: ${solicitud.estado}</small>
                    </div>
                </div>
            `;

            contenedorSolicitudes.appendChild(tarjeta);
        });
    }

    // Función para generar el HTML de la lista de productos
    function generarListaProductos(productos) {
        // Si no hay productos o no es un array
        if (!Array.isArray(productos) || productos.length === 0) {
            return '<p class="text-muted">No hay productos listados</p>';
        }
    
        let html = '<ul class="list-group list-group-flush">';
        productos.forEach(producto => {
            // Validar cada producto
            if (!producto) return;
            
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${producto.nombre || 'Producto sin nombre'}</span>
                    <span class="badge bg-primary rounded-pill">${producto.unidades || 0}</span>
                </li>
            `;
        });
        html += '</ul>';
    
        return html;
    }

    // Función para formatear la fecha
    function formatearFecha(fechaString) {
        if (!fechaString) return 'Fecha no disponible';

        const fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';

        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();

        return `${dia}/${mes}/${año}`;
    }

    // Función para filtrar solicitudes (simplificada)
    function filtrarSolicitudes() {
        const fechaFiltro = filtroFecha.value;
        const idOtFiltro = filtroIdOt.value.trim().toLowerCase();
        const hideCompleted = hideCompletedCheckbox.checked;

        let solicitudesFiltradas = solicitudes.filter(solicitud => {
            // Filtro por fecha
            if (fechaFiltro) {
                try {
                    const fechaSoli = new Date(solicitud.fecha).toISOString().split('T')[0];
                    const fechaFiltroISO = new Date(fechaFiltro).toISOString().split('T')[0];
                    if (fechaSoli !== fechaFiltroISO) return false;
                } catch (e) {
                    console.error('Error al comparar fechas:', e);
                    return false;
                }
            }

            // Filtro por OT (busca en id y clave)
            if (idOtFiltro) {
                const otId = solicitud.ot?.id?.toString().toLowerCase() || '';
                const otClave = solicitud.ot?.clave?.toString().toLowerCase() || '';
                if (!otId.includes(idOtFiltro) && !otClave.includes(idOtFiltro)) {
                    return false;
                }
            }

            // Ocultar completados si está marcado
            if (hideCompleted && solicitud.estado === 'completado') {
                return false;
            }

            return true;
        });

        mostrarSolicitudes(solicitudesFiltradas);
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        filtroFecha.value = '';
        filtroIdOt.value = '';
        hideCompletedCheckbox.checked = false;
        mostrarSolicitudes(solicitudes);
    }
});