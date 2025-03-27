document.addEventListener('DOMContentLoaded', function () { 
    cargarListaEmpleados();

    document.getElementById('btnRegistrar')?.addEventListener('click', () => {
        mostrarFormulario();
    });

    document.getElementById('formEmpleado')?.addEventListener('submit', function (event) {
        event.preventDefault();
        guardarEmpleado();
    });
});

async function cargarListaEmpleados() {
    try {
        const response = await fetch('/api/login/listaEmpleados');
        const data = await response.json();

        if (data.success) {
            mostrarEmpleadosEnCards(data.empleados);
        } else {
            console.error('Error al obtener la lista de empleados:', data.message);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}

function mostrarEmpleadosEnCards(empleados) {
    const contenedor = document.getElementById('listaEmpleados');
    contenedor.innerHTML = '';

    empleados.forEach((empleado, index) => {
        let card = document.createElement('div');
        card.className = 'col-md-4 mb-3';

        card.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title text-center">
                        <a href="#" class="text-decoration-none" data-bs-toggle="collapse" data-bs-target="#infoEmpleado${index}">
                            ${empleado.nombre}
                        </a>
                    </h5>
                    <div id="infoEmpleado${index}" class="collapse">
                        <h6 class="card-subtitle text-muted">${empleado.puesto} - ${empleado.empresa}</h6>
                        <p class="card-text"><strong>Usuario:</strong> ${empleado.username}</p>
                        <p class="card-text"><strong>RFC:</strong> ${empleado.rfc}</p>
                        <p class="card-text"><strong>CURP:</strong> ${empleado.curp}</p>
                        <p class="card-text"><strong>Departamento:</strong> ${empleado.departamento}</p>
                        <p class="card-text"><strong>Contrato:</strong> ${empleado.contrato}</p>
                        <p class="card-text"><strong>Jornada:</strong> ${empleado.jornada}</p>
                        <p class="card-text"><strong>Domicilio:</strong> ${empleado.domicilio}</p>
                        <p class="card-text"><strong>NSS:</strong> ${empleado.nss}</p>
                        <p class="card-text"><strong>Fecha de Ingreso:</strong> ${empleado.ingreso}</p>
                        <p class="card-text"><strong>Teléfono:</strong> ${empleado.telefono}</p>
                        <p class="card-text"><strong>Correo:</strong> ${empleado.correo}</p>
                        <p class="card-text"><strong>Rol:</strong> ${empleado.role}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-warning btn-sm" onclick="mostrarFormulario(${empleado.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado(${empleado.id})">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}

// Cargar la lista al iniciar
cargarListaEmpleados();
// Llamar la función para cargar empleados
async function mostrarFormulario(id = null) { 
    const formulario = document.getElementById('modalEmpleado');
    const titulo = document.getElementById('modalTitulo');
    const empleadoId = document.getElementById('empleadoId');
    

    titulo.textContent = id ? "Editar Empleado" : "Registrar Empleado";
    if (empleadoId) empleadoId.value = id || '';

    const campos = {
        empresa: "empresa",
        nombre: "nombre",
        username: "username",
        rfc: "rfc",
        curp: "curp",
        departamento: "departamento",
        puesto: "puesto",
        contrato: "contrato",
        jornada: "jornada",
        domicilio: "domicilio",
        nss: "nss",
        ingreso: "ingreso",
        telefono: "telefono",
        correo: "correo",
        role: "role"
    };

    function asignarValor(campo, valor) {
        const elemento = document.getElementById(campo);
        if (elemento) {
            elemento.value = valor || ''; 
        } else {
            console.warn(`⚠️ No se encontró el campo: ${campo}`);
        }
    }

    if (id) {
        try {
            console.log(`🔎 Buscando empleado con ID: ${id}...`);
            const response = await fetch(`/api/login/empleado/${id}`);
            if (!response.ok) throw new Error(`Error HTTP! Código: ${response.status}`);

            const data = await response.json();
            console.log("📌 Datos recibidos:", data);

            if (data.success && Array.isArray(data.empleado) && data.empleado.length > 0) {
                const emp = data.empleado[0]; 
                Object.keys(campos).forEach(key => asignarValor(campos[key], emp[key]));
            } else {
                alert("⚠️ No se encontraron datos para este empleado.");
                return;
            }
        } catch (error) {
            console.error("❌ Error al cargar datos del empleado:", error);
            alert("❌ Hubo un problema al obtener los datos del empleado.");
            return;
        }
    } else {
        Object.keys(campos).forEach(key => asignarValor(campos[key], ''));
    }

    const modal = bootstrap.Modal.getOrCreateInstance(formulario);
    modal.show();
}

function guardarEmpleado() {
    const id = document.getElementById('empleadoId').value;
    if (id) {
        editarEmpleado(id);
    }
}

async function editarEmpleado(id) {
    
    const datos = obtenerDatosFormulario();
    datos.id = id;
    

    try {
        const response = await fetch(`/api/login/actualizarEmpleado/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const data = await response.json();
        if (data.success) {
            alert("Empleado actualizado correctamente.");
            cerrarModal();
            cargarListaEmpleados();
        } else {
            alert("Error al actualizar el empleado.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Ocurrió un error al actualizar el empleado.");
    }
}

async function eliminarEmpleado(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
        try {
            const response = await fetch(`/api/login/eliminarEmpleado/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                alert("Empleado eliminado correctamente.");
                cargarListaEmpleados();
            } else {
                alert("Error al eliminar el empleado.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Ocurrió un error al intentar eliminar el empleado.");
        }
    }
}

function obtenerDatosFormulario() {
    return {
        empresa: document.getElementById('empresa').value,
        nombre: document.getElementById('nombre').value,
        username: document.getElementById('username').value,
        rfc: document.getElementById('rfc').value,
        curp: document.getElementById('curp').value,
        departamento: document.getElementById('departamento').value,
        puesto: document.getElementById('puesto').value,
        contrato: document.getElementById('contrato').value,
        jornada: document.getElementById('jornada').value,
        domicilio: document.getElementById('domicilio').value,
        nss: document.getElementById('nss').value,
        ingreso: document.getElementById('ingreso').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('correo').value,
        role: document.getElementById('role').value
    };
    
}

function cerrarModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEmpleado'));
    modal.hide();
}
