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
            mostrarEmpleadosEnTabla(data.empleados);
        } else {
            console.error('Error al obtener la lista de empleados:', data.message);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}

function mostrarEmpleadosEnTabla(empleados) {
    const tabla = document.getElementById('tablaEmpleados').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '';

    empleados.forEach(empleado => {
        let fila = tabla.insertRow();
        fila.insertCell(0).textContent = empleado.id;
        fila.insertCell(1).textContent = empleado.empresa;
        fila.insertCell(2).textContent = empleado.nombre;
        fila.insertCell(3).textContent = empleado.username;
        fila.insertCell(4).textContent = empleado.rfc;
        fila.insertCell(5).textContent = empleado.curp;
        fila.insertCell(6).textContent = empleado.departamento;
        fila.insertCell(7).textContent = empleado.puesto;
        fila.insertCell(8).textContent = empleado.contrato;
        fila.insertCell(9).textContent = empleado.jornada;
        fila.insertCell(10).textContent = empleado.domicilio;
        fila.insertCell(11).textContent = empleado.nss;
        fila.insertCell(12).textContent = empleado.ingreso;
        fila.insertCell(13).textContent = empleado.telefono;
        fila.insertCell(14).textContent = empleado.correo;
        fila.insertCell(15).textContent = empleado.role;
        // No se muestra la contraseña por seguridad

        let acciones = fila.insertCell(16);
        acciones.innerHTML = `
            <button class="btn btn-warning btn-sm me-2" onclick="mostrarFormulario(${empleado.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado(${empleado.id})">Eliminar</button>
        `;
    });
}

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
