document.addEventListener('DOMContentLoaded', () => {
  // Seleccionar los formularios
  const loginForm = document.getElementById('loginForm');
  const registroForm = document.getElementById('registroForm');

  // **LOGIN**
  if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
          e.preventDefault(); // Evita el envío predeterminado del formulario

          const username = document.getElementById('username').value.trim();
          const password = document.getElementById('password').value.trim();

          if (!username || !password) {
              alert('Por favor, completa todos los campos.');
              return;
          }

          try {
              const response = await fetch('/api/login/login', { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password }),
              });

              const data = await response.json();

              if (response.ok) {
                  localStorage.setItem('user', JSON.stringify(data.user)); // Guardar usuario en localStorage
                  
                  // **Verificar el rol del usuario**
                  if (data.user && data.user.role === 'admin') {
                      window.location.href = 'inicioAdmin.html'; // Redirigir a la página de administrador
                  } else {
                      window.location.href = 'index1.html'; // Redirigir a la página principal
                  }
              } else {
                  alert(data.message || 'Error al iniciar sesión');
              }
          } catch (error) {
              console.error('Error al iniciar sesión:', error);
              alert('Ocurrió un error en el servidor.');
          }
      });
  }

  // **REGISTRO**
  if (registroForm) {
      registroForm.addEventListener('submit', async function (e) {
          e.preventDefault(); // Evita el envío predeterminado del formulario

          const formData = {
              nombre: document.getElementById('nombre').value.trim(),
              rfc: document.getElementById('rfc').value.trim(),
              curp: document.getElementById('curp').value.trim(),
              departamento: document.getElementById('departamento').value,
              puesto: document.getElementById('puesto').value.trim(),
              contrato: document.getElementById('contrato').value,
              jornada: document.getElementById('jornada').value,
              domicilio: document.getElementById('domicilio').value.trim(),
              nss: document.getElementById('nss').value.trim(),
              ingreso: document.getElementById('ingreso').value,
              password: document.getElementById('password').value.trim(),
              telefono: document.getElementById('telefono').value.trim(),
              correo: document.getElementById('correo').value.trim(),
          };

          // **Validaciones**
          if (Object.values(formData).some(value => value === '')) {
              alert('Por favor, completa todos los campos.');
              return;
          }

          if (!validateEmail(formData.correo)) {
              alert('Ingresa un correo válido.');
              return;
          }

          if (formData.password.length < 6) {
              alert('La contraseña debe tener al menos 6 caracteres.');
              return;
          }

          try {
              const response = await fetch('/api/login/registroUsuario', { // Ruta corregida
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
              });

              const data = await response.json();

              if (response.ok) {
                  alert('Registro exitoso. Revisa tu correo para validar tu cuenta.');
                  window.location.href = 'login.html'; // Redirigir al login
              } else {
                  alert(data.message || 'Error al registrar usuario');
              }
          } catch (error) {
              console.error('Error al registrar usuario:', error);
              alert('Ocurrió un error en el servidor.');
          }
      });
  }

  // **Función para validar email**
  function validateEmail(email) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
  }
});
