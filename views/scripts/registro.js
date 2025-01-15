// Función para crear un nuevo registro
document.getElementById("crearRegistroForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        clave: document.getElementById("clave").value,
        empresa: document.getElementById("empresa").value,
        fechaEnvio: document.getElementById("fechaEnvio").value,
        descripcion: document.getElementById("descripcion").value,
        contacto: document.getElementById("contacto").value,
        importeCotizado: document.getElementById("importeCotizado").value,
        resultado: document.getElementById("resultado").value
    };

    const response = await fetch("/api/registro/crear", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.mensaje}`);
    } else {
        const result = await response.json();
        alert(result.mensaje);
    }
});

