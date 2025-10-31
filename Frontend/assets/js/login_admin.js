// Función para mostrar/ocultar contraseña
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

// ----------------------------------------------------
// LÓGICA DE INICIO DE SESIÓN DEL ADMINISTRADOR
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formLoginAdmin');
    
    if (!form) return; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capturar credenciales
        const correo = document.getElementById('correoAdmin').value.trim();
        const contrasena = document.getElementById('contrasenaAdmin').value.trim();

        if (!correo || !contrasena) {
            alert('Por favor, ingresa el correo y la contraseña de administrador.');
            return;
        }

        try {
            // 2. Llamar al endpoint de login (usando la misma API /api/login)
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await res.json();
            
            if (res.status !== 200) {
                alert(data.error || 'Credenciales de Administrador incorrectas. Acceso denegado.');
                return;
            }

            // ÉXITO: Recibir el Token y Rol (VERIFICACIÓN EN EL CLIENTE)
            const { token, usuario } = data;
            
            // 3. Verificación de Rol explícita en el cliente (capa de seguridad extra)
            if (usuario.rol !== 'Administrador') {
                alert('Credenciales válidas, pero el rol no es de Administrador. Acceso denegado.');
                return;
            }

            // 4. Almacenar el JWT y redirigir
            localStorage.setItem('authToken', token);
            localStorage.setItem('userName', usuario.nombre);
            localStorage.setItem('userRole', usuario.rol);

            alert('¡Acceso al Panel de Administrador exitoso!');

            // 5. Redirección al panel
            window.location.href = 'panel.html'; 

        } catch (err) {
            console.error('Error en la conexión o el servidor:', err);
            alert('Error al conectar con el servidor.');
        }
    });
});