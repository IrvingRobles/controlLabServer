document.addEventListener("DOMContentLoaded", async function () {
    await cargarRegistros();
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
        if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron obtener los registros`);

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
    if (!tbody) return console.error("No se encontró la tabla.");

    tbody.innerHTML = ""; // Limpiar la tabla antes de agregar nuevos registros

    const fragment = document.createDocumentFragment();
    registros.forEach(({ id, folio, fecha_ingreso, nombre_cliente, descripcion_equipo }) => {
        const fila = document.createElement("tr");
        fila.dataset.id = id; // Guardar el ID en un atributo de datos
        fila.innerHTML = `
            <td>${folio}</td>
            <td>${fecha_ingreso}</td>
            <td>${nombre_cliente || "N/A"}</td>
            <td>${descripcion_equipo || "N/A"}</td>
        `;
        fragment.appendChild(fila);
    });

    tbody.appendChild(fragment);
}


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

// 🔹 Función para mostrar alertas con Bootstrap
function mostrarMensaje(mensaje, tipo) {
    const alertContainer = document.getElementById("alertContainer");
    const alert = document.createElement("div");
    alert.className = `alert alert-${tipo} alert-dismissible fade show`;
    alert.role = "alert";
    alert.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}


// 🔹 Evento para cargar datos al hacer clic en una fila
document.addEventListener("DOMContentLoaded", () => { 
    const tbody = document.querySelector("#tablaRegistros tbody");
    if (!tbody) return console.error("No se encontró la tabla.");

    tbody.addEventListener("click", async function (event) {
        const fila = event.target.closest("tr");
        if (!fila) return;

        const id = fila.dataset.id; // Obtener ID desde dataset
        if (!id) return console.error("El ID de la fila está vacío.");

        console.log("Cargando datos del ID:", id); // Depuración

        try {
            await cargarDatosEnFormulario(id);
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    });
});

// ✅ Cargar los datos de un registro en el formulario al hacer clic en una fila
async function cargarDatosEnFormulario(id) {
    try {
        console.log("Obteniendo datos de la API para el ID:", id); // Depuración
        const response = await fetch(`/api/registro/obtenerMaterial/${id}`);

        if (!response.ok) throw new Error(`Error en la respuesta de la API: ${response.status}`);

        const data = await response.json();
        if (!data || !data.registro) {
            throw new Error("La API devolvió un objeto vacío o sin datos de 'registro'.");
        }

        const registro = data.registro; // Acceder correctamente a los datos
        console.log("Datos obtenidos:", registro); // Depuración

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

        // Guardamos el 'id' real en un campo oculto para usarlo en la actualización
        document.getElementById("idReal").value = registro.id;

        mostrarMensaje("Registro cargado en el formulario.", "success");
    } catch (error) {
        console.error("Error al cargar los datos en el formulario:", error);
        mostrarMensaje("No se pudieron cargar los datos del registro.", "danger");
    }
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
