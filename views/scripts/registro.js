document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtener valores del formulario con una función auxiliar
    const getValue = (id) => document.getElementById(id)?.value.trim() || "";

    const cliente = getValue("cliente");
    const fechaEnvio = getValue("fechaEnvio");
    const empresa = getValue("empresa");
    const descripcion = getValue("descripcion"); // Cambiado de 'resultado' a 'descripcion'
    const contacto = getValue("contacto");
    const lugar = getValue("lugar");

    // Validar los campos obligatorios
    if (!cliente || !fechaEnvio || !empresa) {
        alert("Cliente, empresa y fecha de envío son obligatorios.");
        return;
    }

    // Generar la clave automáticamente
    const claveGenerada = generarClave(cliente, fechaEnvio);

    // Obtener el usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("user"));
    const creadoPor = usuario ? usuario.username : "Desconocido";

    // Crear objeto con los datos del formulario (sin OT ni importeCotizado)
    const data = {
        clave: claveGenerada,
        empresa,
        fechaEnvio,
        descripcion, // Usando 'descripcion' en lugar de 'resultado'
        contacto,
        lugar,
        cliente,
        creadoPor
    };

    try {
        // Enviar solicitud al servidor
        const response = await fetch("/api/registro/crear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Manejo de la respuesta del servidor
        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.mensaje}`);
        } else {
            const result = await response.json();
            alert(result.mensaje);
            // Opcional: Redirigir o limpiar el formulario
            document.getElementById("crearRegistroForm").reset();
        }
    } catch (error) {
        alert("Error de red o del servidor.");
        console.error(error);
    }
});

// Función para generar la clave automáticamente
function generarClave(cliente, fecha) {
    if (!cliente || !fecha) return "";

    // Extraer las iniciales del nombre del cliente
    const iniciales = cliente
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();

    // Generar un número aleatorio de 4 dígitos
    const folio = Math.floor(1000 + Math.random() * 9000);

    // Formatear la fecha como YYYYMMDD
    const fechaFormateada = fecha.replace(/-/g, "");

    return `${iniciales}${folio}${fechaFormateada}`;
}
