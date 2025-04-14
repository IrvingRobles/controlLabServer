function actualizarEstadoBotones() {
    const btnRegistrar = document.getElementById("btnRegistrar");
    const btnActualizar = document.getElementById("btnActualizar");
    const idReal = document.getElementById("idReal").value.trim();

    if (idReal === "") {
        // Si no hay ID, es un nuevo registro
        btnRegistrar.disabled = false;  // Habilitar botón Registrar
        btnActualizar.disabled = true;  // Deshabilitar botón Actualizar
    } else {
        // Si hay ID, es una actualización
        btnRegistrar.disabled = true;   // Deshabilitar botón Registrar
        btnActualizar.disabled = false; // Habilitar botón Actualizar
    }
}

// 🔹 Llamar a esta función en los lugares correctos:
document.addEventListener("DOMContentLoaded", async function () {
    await cargarRegistros();
    actualizarEstadoBotones();
    await autocompletarCampos();
});

// 🔹 Obtener valores de los inputs
const obtenerValor = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

// 🔹 Formatear fecha a "yyyy-MM-dd"
const formatearFecha = (fecha) => fecha ? new Date(fecha).toISOString().split("T")[0] : "";

// 🔹 Autocompletar "Folio", "Fecha de Ingreso" y "Responsable del Ingreso"
async function autocompletarCampos() {
    try {
        const response = await fetch("/api/registro/ultimoFolio");
        if (!response.ok) throw new Error("No se pudo obtener el último folio");

        const { ultimo_folio } = await response.json();

        // ✅ Asegurar que el folio se maneja como número
        const nuevoFolio = (parseInt(ultimo_folio, 10) || 0) + 1;

        document.getElementById("folio").value = nuevoFolio;
        document.getElementById("fechaIngreso").value = new Date().toISOString().split("T")[0];

        const usuario = JSON.parse(localStorage.getItem("user") || "{}");
        document.getElementById("responsableIngreso").value = usuario?.username?.toUpperCase() || "DESCONOCIDO";
    } catch (error) {
        console.error("Error al autocompletar los datos:", error);
    }
}

// 🔹 Cargar registros en la tabla
async function cargarRegistros() {
    try {
        const response = await fetch("/api/registro/listaMateriales");
        if (!response.ok) throw new Error("No se pudieron obtener los registros");

        const { registros } = await response.json();
        mostrarRegistrosEnTabla(registros);
    } catch (error) {
        console.error("Error al obtener los registros:", error);
        mostrarMensaje("No se pudieron cargar los registros.", "danger");
    }
}

// 🔹 Mostrar registros en la tabla
function mostrarRegistrosEnTabla(registros) {
    const tbody = document.querySelector("#tablaRegistros tbody");
    tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos registros

    registros.forEach(({ id, folio, fecha_ingreso, nombre_cliente, descripcion_equipo }) => {
        const fila = tbody.insertRow();
        fila.innerHTML = `
            <td>${folio}</td>
            <td>${fecha_ingreso}</td>
            <td>${nombre_cliente || "N/A"}</td>
            <td>${descripcion_equipo || "N/A"}</td>
            <td>
                <button class="btn btn-danger btn-sm btn-eliminar" data-id="${id}">Eliminar</button>
            </td>
        `;
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => eliminarRegistro(btn.dataset.id));
    });
}

// 🔹 Eliminar registro
async function eliminarRegistro(id) {
    if (!confirm("¿Estás seguro de que quieres eliminar este registro?")) return;

    try {
        const response = await fetch(`/api/registro/eliminarMaterial/${id}`, { method: "DELETE" });
        const result = await response.json();
        mostrarMensaje(result.mensaje, "success");
        await cargarRegistros();
        await autocompletarCampos();
    } catch (error) {
        mostrarMensaje("Error al eliminar el registro.", "danger");
        console.error(error);
    }
}
function mostrarMensaje(mensaje, tipo) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert');
    
    // Define el tipo de alerta según el tipo que se pase
    if (tipo === 'success') {
        alertDiv.classList.add('alert-success');
    } else if (tipo === 'danger') {
        alertDiv.classList.add('alert-danger');
    } else if (tipo === 'warning') {
        alertDiv.classList.add('alert-warning');
    }

    // Contenido de la alerta
    alertDiv.textContent = mensaje;
    
    // Añadir la alerta al contenedor
    alertContainer.appendChild(alertDiv);

    // Ocultar la alerta después de 3 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}



// ✅ Agregar eventos a las filas dinámicamente
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#tablaRegistros tbody").addEventListener("click", async function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return; // Si no hay fila, salir

        // Obtener el ID del registro
        const btnEliminar = fila.querySelector(".btn-eliminar");
        if (!btnEliminar) {
            console.error("No se encontró el botón de eliminar en la fila.");
            return;
        }

        const id = btnEliminar.dataset.id;
        if (!id) {
            console.error("ID del registro no encontrado.");
            return;
        }

        console.log("Cargando datos del ID:", id); // Depuración

        // Llamar a la función para cargar los datos en el formulario
        await cargarDatosEnFormulario(id);
    });
});

// 🔹 Validar campos antes de enviar
function validarCampos(data) {
    const camposObligatorios = [
        "folio", "fecha_ingreso", "responsable_ingreso",
        "nombre_cliente", "orden_trabajo", "descripcion_equipo",
        "marca", "modelo", "numero_serie", "motivo_ingreso"
    ];

    for (const campo of camposObligatorios) {
        if (!data[campo]) {
            mostrarMensaje(`El campo ${campo.replace("_", " ")} es obligatorio.`, "warning");
            return false;
        }
    }
    return true;
}

// 🔹 Enviar un nuevo registro
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        folio: obtenerValor("folio"),
        fecha_ingreso: document.getElementById("fechaIngreso").value,
        responsable_ingreso: obtenerValor("responsableIngreso"),
        nombre_cliente: obtenerValor("nombreCliente"),
        orden_trabajo: obtenerValor("ordenTrabajo"),
        descripcion_equipo: obtenerValor("descripcionEquipo"),
        marca: obtenerValor("marca"),
        modelo: obtenerValor("modelo"),
        numero_serie: obtenerValor("numeroSerie"),
        motivo_ingreso: obtenerValor("motivoIngreso"),
        fecha_compromiso: document.getElementById("fechaCompromiso").value || null,
        acciones_realizadas: obtenerValor("accionesRealizadas"),
        fecha_envio: document.getElementById("fechaEnvio").value || null,
        fecha_regreso: document.getElementById("fechaRegreso").value || null,
        proveedor: obtenerValor("proveedor"),
        fecha_egreso: document.getElementById("fechaEgreso").value || null,
        responsable_egreso: obtenerValor("responsableEgreso"),
        diagnostico: obtenerValor("diagnostico"),
        cotizacion: obtenerValor("cotizacion"),
        fecha_cotizacion: document.getElementById("fechaCotizacion").value || null,
        monto: parseFloat(document.getElementById("monto").value) || 0,
        referencia: obtenerValor("referencia"),
        observaciones: obtenerValor("observaciones"),
    };

    if (!validarCampos(data)) return;

    try {
        const response = await fetch("/api/registro/crearMaterial", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        mostrarMensaje(result.mensaje, "success");
        await cargarRegistros();
        await autocompletarCampos();
    } catch (error) {
        mostrarMensaje("Error al crear el registro.", "danger");
        console.error(error);
    }
});

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    actualizarEstadoBotones();
});

// Después de cargar datos en el formulario
async function cargarDatosEnFormulario(id) {
    try {
        const response = await fetch(`/api/registro/obtenerMaterial/${id}`);
        if (!response.ok) throw new Error(`Error en la API: ${response.status}`);

        const { registro } = await response.json();
        if (!registro) throw new Error("Datos no encontrados.");

        // Llenar los campos del formulario con los datos obtenidos
        document.getElementById("folio").value = registro.folio || "";
        document.getElementById("fechaIngreso").value = registro.fecha_ingreso || "";
        document.getElementById("responsableIngreso").value = registro.responsable_ingreso || "";
        document.getElementById("nombreCliente").value = registro.nombre_cliente || "";
        document.getElementById("ordenTrabajo").value = registro.orden_trabajo || "";
        document.getElementById("descripcionEquipo").value = registro.descripcion_equipo || "";
        document.getElementById("marca").value = registro.marca || "";
        document.getElementById("modelo").value = registro.modelo || "";
        document.getElementById("numeroSerie").value = registro.numero_serie || "";
        document.getElementById("motivoIngreso").value = registro.motivo_ingreso || "";
        document.getElementById("fechaCompromiso").value = registro.fecha_compromiso || "";
        document.getElementById("accionesRealizadas").value = registro.acciones_realizadas || "";
        document.getElementById("fechaEnvio").value = registro.fecha_envio || "";
        document.getElementById("fechaRegreso").value = registro.fecha_regreso || "";
        document.getElementById("proveedor").value = registro.proveedor || "";
        document.getElementById("fechaEgreso").value = registro.fecha_egreso || "";
        document.getElementById("responsableEgreso").value = registro.responsable_egreso || "";
        document.getElementById("diagnostico").value = registro.diagnostico || "";
        document.getElementById("cotizacion").value = registro.cotizacion || "";
        document.getElementById("fechaCotizacion").value = registro.fecha_cotizacion || "";
        document.getElementById("monto").value = registro.monto || 0;
        document.getElementById("referencia").value = registro.referencia || "";
        document.getElementById("observaciones").value = registro.observaciones || "";

        // Guardamos el 'id' real en un campo oculto
        document.getElementById("idReal").value = registro.id;

        // 🔹 Actualizar estado de botones
        actualizarEstadoBotones();
    } catch (error) {
        console.error("Error al cargar los datos en el formulario:", error);
        mostrarMensaje("No se pudieron cargar los datos del registro.", "danger");
    }
}

// 🔹 Al limpiar el formulario, volvemos a la opción de registrar
function limpiarFormulario() {
    document.getElementById("crearRegistroForm").reset();
    document.getElementById("idReal").value = ""; // Borrar ID real
    actualizarEstadoBotones(); // 🔹 Asegurar que el botón de registrar se habilita
}

async function actualizarRegistro() {
    try {
        const idReal = document.getElementById("idReal").value; // Usamos el ID real

        if (!idReal) {
            mostrarMensaje("No se puede actualizar sin un ID válido.", "warning");
            return;
        }

        // Obtener los valores del formulario
        const datosActualizados = {
            folio: document.getElementById("folio").value,
            fecha_ingreso: document.getElementById("fechaIngreso").value,
            responsable_ingreso: document.getElementById("responsableIngreso").value,
            nombre_cliente: document.getElementById("nombreCliente").value,
            orden_trabajo: document.getElementById("ordenTrabajo").value,
            descripcion_equipo: document.getElementById("descripcionEquipo").value,
            marca: document.getElementById("marca").value,
            modelo: document.getElementById("modelo").value,
            numero_serie: document.getElementById("numeroSerie").value,
            motivo_ingreso: document.getElementById("motivoIngreso").value,
            fecha_compromiso: document.getElementById("fechaCompromiso").value,
            acciones_realizadas: document.getElementById("accionesRealizadas").value,
            fecha_envio: document.getElementById("fechaEnvio").value,
            fecha_regreso: document.getElementById("fechaRegreso").value,
            proveedor: document.getElementById("proveedor").value,
            fecha_egreso: document.getElementById("fechaEgreso").value,
            responsable_egreso: document.getElementById("responsableEgreso").value,
            diagnostico: document.getElementById("diagnostico").value,
            cotizacion: document.getElementById("cotizacion").value,
            fecha_cotizacion: document.getElementById("fechaCotizacion").value,
            monto: document.getElementById("monto").value,
            referencia: document.getElementById("referencia").value,
            observaciones: document.getElementById("observaciones").value
        };

        console.log("Enviando datos actualizados:", datosActualizados); // Depuración

        // Usamos el 'idReal' para actualizar el registro
        const response = await fetch(`/api/registro/actualizarMaterial/${idReal}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosActualizados),
        });

        if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);

        const resultado = await response.json();
        console.log("Respuesta de actualización:", resultado);

        mostrarMensaje("Registro actualizado correctamente.", "success");
    } catch (error) {
        console.error("Error al actualizar el registro:", error);
        mostrarMensaje("No se pudo actualizar el registro.", "danger");
    }
}

