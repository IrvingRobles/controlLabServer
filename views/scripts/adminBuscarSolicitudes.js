document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const contenedorSolicitudes = document.getElementById('contenedorSolicitudes');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroIdOt = document.getElementById('filtroIdOt');
    const filtroIdUsuario = document.getElementById('filtroIdUsuario');
    const hideCompletedCheckbox = document.getElementById('hideCompleted');

    let solicitudes = [];

    // Cargar solicitudes al iniciar
    cargarSolicitudes();

    // Event listeners
    btnFiltrar.addEventListener('click', filtrarSolicitudes);
    btnLimpiar.addEventListener('click', limpiarFiltros);
    hideCompletedCheckbox.addEventListener('change', filtrarSolicitudes);

    // ======================
    // SISTEMA DE MODALES
    // ======================

    /**
     * Muestra un modal de información centrado en pantalla
     * @param {string} title - Título del modal
     * @param {string} message - Mensaje a mostrar
     * @param {boolean} isSuccess - true para éxito, false para error
     * @param {string|null} redirectUrl - URL para redireccionar (opcional)
     */
    function showModal(title, message, isSuccess, redirectUrl = null) {
        // Crear el modal dinámicamente
        const modalHTML = `
        <div class="modal fade" id="dynamicModal" tabindex="-1" aria-labelledby="dynamicModalLabel">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header ${isSuccess ? 'bg-success text-white' : 'bg-danger text-white'}">
                        <h5 class="modal-title" id="dynamicModalLabel">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn ${isSuccess ? 'btn-success' : 'btn-danger'}" id="dynamicModalButton">
                            ${redirectUrl ? 'Continuar' : 'Aceptar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Insertar el modal en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar el modal
        const modalElement = document.getElementById('dynamicModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Configurar el botón del modal
        document.getElementById('dynamicModalButton').addEventListener('click', function () {
            modal.hide();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        });

        // Eliminar el modal del DOM después de cerrarse
        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
        });
    }

    /**
     * Muestra un modal de confirmación centrado
     * @param {string} message - Mensaje de confirmación
     * @returns {Promise<boolean>} - Devuelve una promesa que resuelve true/false
     */
    function showConfirm(message) {
        return new Promise((resolve) => {
            const confirmHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title" id="confirmModalLabel">Confirmación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="confirmModalCancel">Cancelar</button>
                            <button type="button" class="btn btn-warning" id="confirmModalAccept">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
            `;

            document.body.insertAdjacentHTML('beforeend', confirmHTML);

            const modalElement = document.getElementById('confirmModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Manejar aceptar
            document.getElementById('confirmModalAccept').addEventListener('click', function () {
                resolve(true);
                modal.hide();
            });

            // Manejar cancelar
            document.getElementById('confirmModalCancel').addEventListener('click', function () {
                resolve(false);
                modal.hide();
            });

            // Limpiar después de cerrar
            modalElement.addEventListener('hidden.bs.modal', function () {
                modalElement.remove();
            });
        });
    }

    // ======================
    // FUNCIONALIDAD PRINCIPAL
    // ======================

    // Función para cargar las solicitudes desde el backend
    async function cargarSolicitudes() {
        try {
            const response = await fetch('/api/almacen/x/solicitudes');

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor devolvió una respuesta no válida');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar solicitudes');
            }

            if (data.success) {
                solicitudes = data.data;
                filtrarSolicitudes(); // Mostrar con los filtros actuales

                // Debug: Mostrar estructura de datos en consola
                console.log('Datos cargados:', solicitudes);
            } else {
                showModal('Error', data.message || 'Error al cargar las solicitudes', false);
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error', error.message || 'Error de conexión con el servidor', false);
        }
    }

    // Función para mostrar las solicitudes en tarjetas
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
                            <p class="mb-1"><strong>Usuario:</strong> ${solicitud.usuario.username}</p>
                            <p class="mb-1"><strong>OT:</strong> ${solicitud.ot?.clave || 'N/A'}</p>
                            <p class="mb-1"><strong>Nota:</strong> ${solicitud.nota || 'Sin nota'}</p>
                        </div>
                        <div class="productos-container mb-3">
                            <h6>Productos:</h6>
                            ${productosHTML}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${solicitud.idSoli}">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                        <div>
                        ${solicitud.estado === 'pendiente' ? `
                            <button class="btn btn-sm btn-success btn-completar me-2" data-id="${solicitud.idSoli}">
                                <i class="bi bi-check-circle"></i> Completar
                            </button>
                                                        <button class="btn btn-sm btn-primary btn-enviar" data-id="${solicitud.idSoli}">
                                <i class="bi bi-send"></i> Enviar
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            contenedorSolicitudes.appendChild(tarjeta);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function () {
                const idSoli = this.getAttribute('data-id');
                eliminarSolicitud(idSoli);
            });
        });

        document.querySelectorAll('.btn-enviar').forEach(btn => {
            btn.addEventListener('click', function () {
                const idSoli = this.getAttribute('data-id');
                enviarAAlmacen(idSoli);
            });
        });

        document.querySelectorAll('.btn-completar').forEach(btn => {
            btn.addEventListener('click', function () {
                const idSoli = this.getAttribute('data-id');
                completarSolicitud(idSoli);
            });
        });
    }

    // Función para generar el HTML de la lista de productos
    function generarListaProductos(productos) {
        if (!productos || productos.length === 0) {
            return '<p class="text-muted">No hay productos listados</p>';
        }

        let html = '<ul class="list-group list-group-flush">';
        productos.forEach(producto => {
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

    // Función para filtrar solicitudes (MEJORADA)
    function filtrarSolicitudes() {
        const fechaFiltro = filtroFecha.value;
        const idOtFiltro = filtroIdOt.value.trim().toLowerCase();
        const idUsuarioFiltro = filtroIdUsuario.value.trim().toLowerCase();
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

            // Filtro por Usuario (busca en id y username)
            if (idUsuarioFiltro) {
                const usuarioId = solicitud.usuario?.id?.toString().toLowerCase() || '';
                const usuarioNombre = solicitud.usuario?.username?.toLowerCase() || '';
                if (!usuarioId.includes(idUsuarioFiltro) && !usuarioNombre.includes(idUsuarioFiltro)) {
                    return false;
                }
            }

            // Ocultar completados si está marcado
            if (hideCompleted && solicitud.estado === 'completado') {
                return false;
            }

            return true;
        });

        // Debug: Mostrar resultados del filtrado
        console.log('Filtros aplicados:', {
            fecha: fechaFiltro,
            idOt: idOtFiltro,
            idUsuario: idUsuarioFiltro,
            hideCompleted: hideCompleted
        });
        console.log('Resultados del filtrado:', solicitudesFiltradas);

        mostrarSolicitudes(solicitudesFiltradas);
    }

    // Función para limpiar filtros
    function limpiarFiltros() {
        filtroFecha.value = '';
        filtroIdOt.value = '';
        filtroIdUsuario.value = '';
        hideCompletedCheckbox.checked = false;
        mostrarSolicitudes(solicitudes);
    }

    // Función para eliminar una solicitud
    async function eliminarSolicitud(idSoli) {
        const confirmado = await showConfirm('¿Estás seguro de que deseas eliminar esta solicitud?');
        if (!confirmado) return;

        try {
            const response = await fetch(`/api/almacen/x/solicitudes/${idSoli}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('El servidor devolvió una respuesta no válida');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al eliminar la solicitud');
            }

            if (data.success) {
                showModal('Éxito', 'Solicitud eliminada correctamente', true);
                cargarSolicitudes(); // Recargar la lista
            } else {
                showModal('Error', data.message || 'Error al eliminar la solicitud', false);
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error', error.message || 'Error de conexión con el servidor', false);
        }
    }

    // Función para marcar una solicitud como completada
    async function completarSolicitud(idSoli) {
        const confirmado = await showConfirm('¿Marcar esta solicitud como completada?');
        if (!confirmado) return;

        try {
            const response = await fetch(`/api/almacen/x/solicitudes/${idSoli}/completar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al completar la solicitud');
            }

            if (data.success) {
                showModal('Éxito', 'Solicitud marcada como completada', true);
                cargarSolicitudes(); // Recargar la lista
            } else {
                showModal('Error', data.message || 'Error al completar la solicitud', false);
            }
        } catch (error) {
            console.error('Error:', error);
            showModal('Error', error.message || 'Error de conexión con el servidor', false);
        }
    }

    // Función para enviar a almacén
    function enviarAAlmacen(idSoli) {
        // Guardar en sessionStorage el ID para usarlo en la otra página
        sessionStorage.setItem('solicitudAlmacen', idSoli);
        // Redirigir a la página de salida de almacén
        window.location.href = 'adminVistaAlmacen.html';
    }
});