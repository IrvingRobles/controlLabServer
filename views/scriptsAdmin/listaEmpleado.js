document.addEventListener('DOMContentLoaded', function () {
    cargarListaEmpleados();
});

async function cargarListaEmpleados() {
    try {
        const response = await fetch('/api/login/listaEmpleados'); // Llamada a la API
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
    tabla.innerHTML = ''; // Limpiar contenido anterior

    empleados.forEach(empleado => {
        let fila = tabla.insertRow();
        fila.insertCell(0).textContent = empleado.id;
        fila.insertCell(1).textContent = empleado.nombre;
        fila.insertCell(2).textContent = empleado.username;
        fila.insertCell(3).textContent = empleado.departamento;
        fila.insertCell(4).textContent = empleado.puesto;
        fila.insertCell(5).textContent = empleado.telefono;
        fila.insertCell(6).textContent = empleado.correo;
    });
}
