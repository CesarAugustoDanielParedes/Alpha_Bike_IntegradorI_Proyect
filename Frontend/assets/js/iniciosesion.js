// Función para mostrar/ocultar contraseña (YA EXISTENTE)
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
// LÓGICA DE INICIO DE SESIÓN CON JWT
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Identificar el formulario y sus inputs
    const form = document.querySelector('.auth-form'); 
    // Asegúrate de dar ID a los inputs para fácil acceso
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = document.getElementById('login-password'); // Ya tiene ID

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const correo = emailInput.value.trim();
        const contrasena = passwordInput.value.trim();

        if (!correo || !contrasena) {
            alert('Por favor, ingresa tu correo y contraseña.');
            return;
        }

        try {
            // Llama a tu endpoint de login en Node.js
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await res.json();
            
            if (res.status !== 200) {
                // Manejar error de autenticación (ej: 401 Unauthorized)
                alert(data.error || 'Credenciales incorrectas.');
                return;
            }

            // ÉXITO: Recibir el Token y Rol
            const { token, usuario } = data; // Esperamos recibir el token y la info del usuario/rol
            
            // 2. Almacenar el JWT y los datos del usuario para mantener la sesión
            localStorage.setItem('authToken', token);
            localStorage.setItem('userName', usuario.nombre || 'Cliente');
            localStorage.setItem('userRole', usuario.rol); // Rol es crucial para la redirección

            alert('¡Inicio de sesión exitoso!');

            // 3. Redirección basada en el Rol (Lógica de acceso al panel)
            if (usuario.rol === 'Administrador') {
                window.location.href = 'admin/panel.html'; // Redirige al Panel de Administrador
            } else {
                window.location.href = 'inicio.html'; // Redirige al inicio (Cliente)
            }

        } catch (err) {
            console.error('Error en la conexión o el servidor:', err);
            alert('Error al conectar con el servidor. Inténtalo de nuevo más tarde.');
        }
    });
});