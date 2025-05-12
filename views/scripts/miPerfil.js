async function cargarPerfil() {
    try {
        const usuario = JSON.parse(localStorage.getItem('user'));
        if (!usuario || !usuario.id) {
            console.error('No se encontró usuario en localStorage');
            return;
        }

        // 1. Hacer la petición GET
        const response = await fetch(`/api/login/users/${usuario.id}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // 2. Obtener los datos de la respuesta
        const result = await response.json();
        console.log("Respuesta completa:", result); // Para depuración
        
        // 3. IMPORTANTE: La respuesta es {success, data: [...]} - tomar el primer elemento
        if (!result.success || !result.data || result.data.length === 0) {
            throw new Error('Datos de usuario no encontrados');
        }
        
        const userData = result.data[0]; // Tomamos el primer elemento del array
        console.log("Datos del usuario:", userData); // Verificar en consola

        // 4. Mapear los datos a los campos del formulario
        const campos = {
            'empresa': userData.empresa || 'CALTECMEX',
            'nombre': userData.nombre || '',
            'rfc': userData.rfc || '',
            'curp': userData.curp || '',
            'departamento': userData.departamento || 'SERVICIO',
            'puesto': userData.puesto || '',
            'contrato': userData.contrato || 'PERMANENTE', // Valor por defecto
            'jornada': userData.jornada || 'MENSUAL', // Valor por defecto
            'domicilio': userData.domicilio || '',
            'nss': userData.nss || '',
            'telefono': userData.telefono || '',
            'ingreso': userData.ingreso ? formatDate(userData.ingreso) : ''
        };

        // 5. Llenar el formulario
        Object.entries(campos).forEach(([name, value]) => {
            const field = document.querySelector(`[name="${name}"]`);
            if (field) {
                field.value = value;
                // Para selects, asegurar que se seleccione la opción correcta
                if (field.tagName === 'SELECT') {
                    const option = field.querySelector(`option[value="${value}"]`);
                    if (option) option.selected = true;
                }
                field.dataset.originalValue = value; // Guardar valor original
            }
        });

        // 6. Deshabilitar empresa según lo requerido
        const empresaField = document.querySelector('[name="empresa"]');
        if (empresaField) empresaField.disabled = true;

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al cargar perfil: ' + error.message);
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return '';
    }
}

// Asegúrate de llamar a cargarPerfil cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    cargarPerfil();
    
    // También actualiza el nombre en el header
    const usuario = JSON.parse(localStorage.getItem('user'));
    const nombreHeader = document.getElementById('perfil-nombre');
    if (usuario && nombreHeader) {
        nombreHeader.textContent = usuario.nombre || usuario.username || 'Usuario';
    }
});

// Guardar cambios
async function guardarCambios() {
    const usuario = JSON.parse(localStorage.getItem('user'));
    if (!usuario) return;

    const formData = new FormData(document.getElementById('profileForm'));
    const updates = Object.fromEntries(formData.entries());

    try {

        // Mostrar loading en el botón
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Guardando...';

        const response = await fetch(`/api/login/users/${usuario.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar cambios');
        }

        alert('¡Perfil actualizado correctamente!');
        window.location.reload();

    } catch (error) {
        console.error('Error al guardar:', error);
        alert(`Error: ${error.message}`);
        document.getElementById('saveBtn').disabled = false;
        document.getElementById('saveBtn').textContent = 'Guardar';
    }
}

// Habilitar/deshabilitar edición de campo
function toggleEdit(fieldName) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.disabled = !input.disabled;
    
    // Enfocar el campo al activar edición
    if (!input.disabled) {
        input.focus();
        if (input.tagName === 'SELECT') {
            input.size = input.options.length; // Mostrar todas las opciones
        }
    }
    
    // Actualizar estado del botón Guardar
    document.getElementById('saveBtn').disabled = !hayCambios();
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // Guardar valores originales en un atributo `data-original-value`
    document.querySelectorAll('input[name], select[name]').forEach(input => {
        const fieldName = input.name;
        if (user[fieldName]) {
            input.value = user[fieldName];
            input.setAttribute('data-original-value', user[fieldName]);
        }
        input.disabled = true; // Bloquear campos inicialmente
    });
});

// Cancelar edición
function cancelEdit() {
    if (!confirm('¿Descartar cambios?')) return;

    // Restaurar valores originales desde `data-original-value`
    document.querySelectorAll('input[name], select[name]').forEach(input => {
        const originalValue = input.getAttribute('data-original-value');
        if (originalValue !== null) {
            input.value = originalValue;
        }
        input.disabled = true; // Bloquear campos nuevamente
    });

    // Deshabilitar botón Guardar
    document.getElementById('saveBtn').disabled = true;
}

// Verificar si hay cambios
// Función para detectar cambios
function hayCambios() {
    let cambios = false;
    document.querySelectorAll('input[name], select[name]').forEach(input => {
        const currentValue = input.value;
        const originalValue = input.getAttribute('data-original-value');
        if (currentValue !== originalValue) {
            cambios = true;
        }
    });
    return cambios;
}

// Evento change para selects (fuerza la detección)
document.querySelectorAll('select[name]').forEach(select => {
    select.addEventListener('change', () => {
        document.getElementById('saveBtn').disabled = !hayCambios();
    });
});

// Función toggleEdit ajustada para selects
function toggleEdit(fieldName) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.disabled = !input.disabled;
    if (!input.disabled && input.tagName === 'SELECT') {
        input.focus();
    }
    // Actualizar estado del botón Guardar (importante)
    document.getElementById('saveBtn').disabled = !hayCambios();
}