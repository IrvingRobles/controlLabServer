document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');  // Obtener el ID de la URL
    if (!id) {
        alert('No se ha proporcionado un ID.');
        return;
    }

    try {
        // Hacer una solicitud GET al servidor para obtener la orden de trabajo y las cotizaciones
        const response = await fetch(`/api/registro/otc/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos');
        }

        const data = await response.json();
        const ordenTrabajo = data.ordenTrabajo;
        const cotizaciones = data.cotizaciones;

        // Función para formatear las fechas en formato yyyy-MM-dd
        function formatDate(isoDate) {
            const date = new Date(isoDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Añadir ceros a los meses
            const day = String(date.getDate()).padStart(2, '0'); // Añadir ceros a los días
            return `${year}-${month}-${day}`;
        }

        // Rellenar los campos del formulario con la información obtenida
        document.getElementById('cliente').value = ordenTrabajo.cliente || '';
        document.getElementById('referencia').value = cotizaciones.length > 0 ? cotizaciones[0].referencia : '';
        document.getElementById('direccion').value = ordenTrabajo.lugar || '';
        document.getElementById('cotizacionNo').value = cotizaciones.length > 0 ? cotizaciones[0].num_cotizacion : '';
        document.getElementById('fecha').value = ordenTrabajo.fecha_envio ? formatDate(ordenTrabajo.fecha_envio) : '';
        document.getElementById('fechaExpiracion').value = cotizaciones.length > 0 ? formatDate(cotizaciones[0].fecha_expiracion) : '';
        document.getElementById('metodoEmbarque').value = cotizaciones.length > 0 ? cotizaciones[0].metodo_embarque : '';
        document.getElementById('empleado_asignado').value = ordenTrabajo.length > 0 ? ordenTrabajo[0].empleado_asignado : '';

        // Puedes agregar detalles a la tabla de materiales si los tienes en los datos
        const tablaMateriales = document.getElementById('tablaMateriales').getElementsByTagName('tbody')[0];
        cotizaciones.forEach(cotizacion => {
            const row = tablaMateriales.insertRow();
            row.insertCell(0).innerText = cotizacion.referencia;  // Ejemplo de cómo agregar datos
            row.insertCell(1).innerText = '1';  // Cantidad
            row.insertCell(2).innerText = 'Unidad';  // Unidad
            row.insertCell(3).innerText = 'Descripción';  // Descripción (puedes personalizar)
            row.insertCell(4).innerText = '100';  // Precio Unitario (ejemplo)
            row.insertCell(5).innerText = '100';  // Importe Total (ejemplo)
        });

    } catch (error) {
        console.error(error);
        alert('Hubo un error al cargar los datos');
    }
});

// Función para guardar los datos del formulario
async function guardarDatos() {
    const cliente = document.getElementById('cliente').value;
    const referencia = document.getElementById('referencia').value;
    const direccion = document.getElementById('direccion').value;
    const cotizacionNo = document.getElementById('cotizacionNo').value;
    const fecha = document.getElementById('fecha').value;
    const fechaExpiracion = document.getElementById('fechaExpiracion').value;
    const metodoEmbarque = document.getElementById('metodoEmbarque').value;
    const empleado_asignado = document.getElementById('empleado_asignado').value;
    const observaciones = document.getElementById('observaciones').value;

    const datos = {
        cliente, referencia, direccion, cotizacionNo, fecha, fechaExpiracion,
        metodoEmbarque, empleado_asignado, observaciones
    };

    try {
        // Hacer una solicitud POST o PUT al servidor para guardar los datos
        const response = await fetch('/api/registro/otc', {
            method: 'PUT',  // Usamos PUT para actualizar
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            alert('Datos guardados exitosamente');
        } else {
            throw new Error('Error al guardar los datos');
        }
    } catch (error) {
        console.error(error);
        alert('Hubo un error al guardar los datos');
    }
}
