function togglePassword(id, el) {
      const input = document.getElementById(id);
      if (input.type === "password") {
        input.type = "text";
        el.textContent = "🙈";
      } else {
        input.type = "password";
        el.textContent = "👁️";
      }
    }
    // SCRIPT ÚNICO Y FINAL

// 1. FUNCIONALIDAD DE MOSTRAR/OCULTAR CONTRASEÑA
function togglePwd(id, icon) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.textContent = input.type === 'password' ? '👁️' : '🙈';
}


// 2. LÓGICA DE ENVÍO Y MANEJO DE REGISTRO
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistro');
    
    // Aseguramos que el formulario exista
    if (!form) return; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // a. CAPTURAR TODOS LOS CAMPOS (Incluye los nuevos: apellido y telefono)
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        // b. Validación básica del lado del cliente
        if (!nombre || !apellido || !telefono || !correo || !contrasena) {
            alert('Completa todos los campos obligatorios.');
            return;
        }

        try {
            // c. LLAMADA A LA API DE NODE.JS
            const res = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Enviar todos los campos al backend
                body: JSON.stringify({ nombre, apellido, telefono, correo, contrasena })
            });
            
            const data = await res.json();
            
            // d. MANEJAR RESPUESTA DEL SERVIDOR
            if (res.status === 200) { 
                alert(data.mensaje || 'Registro exitoso. ¡Bienvenido a Alpha Bike!');
                form.reset();
                // Opcional: Redirigir al login después de un registro exitoso
                window.location.href = 'iniciosesion.html';
            } else {
                // Manejar errores (ej: 400 Bad Request por validación de backend, 500 Server Error)
                alert(data.error || 'Ocurrió un error inesperado al registrar.');
            }
        } catch (err) {
            console.error('Error al conectar con el servidor:', err);
            alert('Error al conectar con el servidor. Verifica que tu backend esté corriendo.');
        }
    });
});
 function togglePwd(id, icon) {
      const input = document.getElementById(id);
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.textContent = input.type === 'password' ? '👁️' : '🙈';
    }

    // Registro
    window.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('formRegistro');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        if (!nombre || !correo || !contrasena) {
          alert('Completa todos los campos');
          return;
        }

        try {
          const res = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, contrasena })
          });
          const data = await res.json();
          alert(data.mensaje || data.error);
          if (data.mensaje) form.reset();
        } catch (err) {
          alert('Error al conectar: ' + err.message);
        }
      });
    });