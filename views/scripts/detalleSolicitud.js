// Función para obtener el parámetro "id" de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para cargar los detalles del registro
async function cargarDetalles() {
    const id = obtenerParametroURL("id"); // Obtener el ID del registro de la URL
    const detallesRegistro = document.getElementById("detallesRegistro");

    // Verificar si no se proporcionó un ID válido
    if (!id) {
        detallesRegistro.innerHTML = `
            <div class="alert alert-danger" role="alert">
                No se proporcionó un ID válido.
            </div>
        `;
        return;
    }

    try {
        const url = `/api/registro/obtener/${id}`; // URL del endpoint
        console.log("Solicitando datos desde:", url);

        // Solicitar los detalles del registro al servidor
        const respuesta = await fetch(url);

        // Verificar el estado de la respuesta
        console.log("Estado de la respuesta:", respuesta.status);
        if (!respuesta.ok) throw new Error("Error al cargar los detalles del registro.");

        const registro = await respuesta.json(); // Parsear la respuesta a JSON
        console.log("Estructura del objeto registro:", JSON.stringify(registro, null, 2));

        // Acceder al objeto anidado bajo "registro"
        const datos = registro.registro || {}; 
        console.log("Datos procesados:", datos);

        // Validar si los datos existen
        if (Object.keys(datos).length === 0) {
            throw new Error("El objeto del registro está vacío o no contiene datos.");
        }

        // Construir el contenido de los detalles
        detallesRegistro.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Registro ID: ${datos.id || "N/A"}</h5>
                    <p><strong>Clave:</strong> ${datos.clave || "N/A"}</p>
                    <p><strong>OT:</strong> ${datos.OT || "N/A"}</p>
                    <p><strong>Empresa:</strong> ${datos.empresa || "N/A"}</p>
                    <p><strong>Fecha de Envío:</strong> ${new Date(datos.fecha_envio).toLocaleDateString() || "N/A"}</p>
                    <p><strong>Descripción:</strong> ${datos.descripcion || "N/A"}</p>
                    <p><strong>Contacto:</strong> ${datos.contacto || "N/A"}</p>
                    <p><strong>Importe Cotizado:</strong> ${datos.importe_cotizado || "N/A"}</p>
                    <p><strong>Resultado:</strong> ${datos.resultado || "N/A"}</p>
                </div>
            </div>
        `;

        console.log("HTML insertado correctamente.");
    } catch (error) {
        console.error("Error al cargar los detalles:", error);
        detallesRegistro.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Error al cargar los detalles del registro: ${error.message}
            </div>
        `;
    }
}

// Cargar los detalles cuando se cargue la página
document.addEventListener("DOMContentLoaded", cargarDetalles);
