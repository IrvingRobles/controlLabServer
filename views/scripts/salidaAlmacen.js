document.getElementById('buscarRegistro').addEventListener('click', async () => {
    const idMov = document.getElementById('idMov').value;

    if (!idMov) {
        alert('Por favor, ingrese un ID Mov.');
        return;
    }

    try {
        // Realiza la solicitud al back-end
        const response = await fetch(`/api/almacen/${idMov}`);
        
        if (!response.ok) {
            throw new Error('Registro no encontrado');
        }

        const data = await response.json();

        // Rellena los campos automáticamente
        document.getElementById('idUsuario').value = data.registro.idUsuario || '';
        document.getElementById('empresa').value = data.registro.empresa || '';
        document.getElementById('tipo_movimiento').value = data.registro.tipo_movimiento || '';
        document.getElementById('fecha').value = data.registro.fecha || '';
        document.getElementById('pedido').value = data.registro.pedido || '';
        document.getElementById('producto').value = data.registro.producto || '';
        document.getElementById('marca').value = data.registro.marca || '';
        document.getElementById('proveedor').value = data.registro.proveedor || '';
        document.getElementById('no_parte').value = data.registro.no_parte || '';
        document.getElementById('no_serie').value = data.registro.no_serie || '';
        document.getElementById('modelo').value = data.registro.modelo || '';
        document.getElementById('equipo').value = data.registro.equipo || '';
        
        // Rellena más campos según sea necesario
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});
/*  folio_vale_salida,
ctd_salidas,
precio_salidas,
solicito,
cliente,
servicio,
aplicacion,
uso_en,
recibio,
condiciones_entrega*/