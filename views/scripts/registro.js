function generarClave(idCliente, fecha) {
    if (!idCliente || !fecha) return "";

    let folio = parseInt(localStorage.getItem("ultimoFolio")) || 1000;
    folio++;
    localStorage.setItem("ultimoFolio", folio.toString());

    return `CL-${idCliente}-${folio}-${fecha}`;
}

function formatearFechaParaClave(fecha) {
    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha;
    return `${partes[2]}${partes[1]}${partes[0]}`; // DDMMYYYY
}

let fechaISO;
document.addEventListener("DOMContentLoaded", async () => {
    const hoy = new Date();
    fechaISO = hoy.toISOString().split("T")[0];
    document.getElementById("fechaEnvio").value = fechaISO;
    await cargarClientes();
});

function mostrarCargando(mostrar) {
    const cargandoElemento = document.getElementById("cargando");
    if (cargandoElemento) {
        cargandoElemento.style.display = mostrar ? "block" : "none";
    }
}

async function cargarClientes() {
    mostrarCargando(true);
    try {
        const response = await fetch("/api/registro/obtenerClientes");
        const clientes = await response.json();

        const select = document.getElementById("clienteSelect");
        select.innerHTML = '<option value="">Seleccione un cliente</option>';

        clientes.forEach(cliente => {
            const option = document.createElement("option");
            option.value = cliente.id_cliente;
            option.textContent = cliente.nombre_cliente;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        alert("No se pudieron cargar los clientes.");
    } finally {
        mostrarCargando(false);
    }
}

document.getElementById("clienteSelect").addEventListener("change", async function () {
    const clienteId = this.value;
    const empresaInput = document.getElementById("empresa");

    if (!clienteId) {
        empresaInput.value = "";
        return;
    }

    try {
        const response = await fetch(`/api/registro/obtenerCliente/${clienteId}`);
        const cliente = await response.json();
        empresaInput.value = cliente && cliente.empresa ? cliente.empresa : '';
    } catch (error) {
        console.error("Error al obtener datos del cliente:", error);
        empresaInput.value = "";
    }
});

window.addEventListener("load", cargarClientes);

document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const getValue = (id) => document.getElementById(id)?.value.trim().toUpperCase() || "";

    const idCliente = document.getElementById("clienteSelect").value;
    const fechaEnvio = document.getElementById("fechaEnvio").value;
    const empresa = getValue("empresa");
    const descripcion = getValue("descripcion");
    const contacto = getValue("contacto");
    const lugar = getValue("lugar");

    if (!idCliente || !fechaEnvio || !empresa) {
        alert("Cliente, empresa y fecha de envío son obligatorios.");
        return;
    }

    const claveGenerada = generarClave(idCliente, formatearFechaParaClave(fechaEnvio));
    const usuario = JSON.parse(localStorage.getItem("user"));
    const creadoPor = usuario?.username?.toUpperCase() || "DESCONOCIDO";

    const data = {
        clave: claveGenerada,
        empresa,
        fechaEnvio,
        descripcion,
        contacto,
        lugar,
        id_cliente: idCliente,
        creadoPor
    };

    try {
        const response = await fetch("/api/registro/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(`Error: ${result.mensaje}`);
        } else {
            alert(`✅ Registro creado con éxito.\n\n🔑 Clave: ${result.clave}\n📄 OT: ${result.OT}`);

            // Mostrar clave y OT debajo del formulario si deseas
            const infoDiv = document.getElementById("infoClaveOt");
            if (infoDiv) {
                infoDiv.innerHTML = `<strong>Clave:</strong> ${result.clave}<br><strong>OT:</strong> ${result.OT}`;
            }

            document.getElementById("crearRegistroForm").reset();
            document.getElementById("fechaEnvio").value = fechaISO;
        }
    } catch (error) {
        alert("Error de red o del servidor.");
        console.error("Error:", error);
    }
});
