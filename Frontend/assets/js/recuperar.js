// ----------------------------------------------------
// Recuperar contraseña - AlphaBike
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Formularios
    const formCorreo = document.getElementById('solicitar-codigo-form');
    const formCodigo = document.getElementById('verificar-codigo-form');
    const formNueva = document.getElementById('nueva-contrasena-form');

    // Inputs
    const inputCorreo = document.getElementById('correo');
    const inputCodigo = document.getElementById('codigo');
    const inputNuevaContrasena = document.getElementById('nuevaContrasena');

    // Variable temporal para recordar el correo actual
    let correoActual = '';

    // -----------------------------------------------
    // 1️⃣ Solicitar código de recuperación
    // -----------------------------------------------
    formCorreo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const correo = inputCorreo.value.trim();
        if (!correo) return alert('Por favor ingresa tu correo electrónico.');

        try {
            const res = await fetch('http://localhost:3000/api/solicitar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });
            const data = await res.json();

            if (!res.ok) return alert(data.error || 'Error al enviar el código.');

            correoActual = correo;
            alert('Código enviado correctamente a tu correo.');
            mostrarFormulario(formCodigo);
        } catch (err) {
            console.error(err);
            alert('Error de conexión con el servidor.');
        }
    });

    // -----------------------------------------------
    // 2️⃣ Verificar código
    // -----------------------------------------------
    formCodigo.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = inputCodigo.value.trim();
        if (!codigo) return alert('Por favor ingresa el código recibido.');

        try {
            const res = await fetch('http://localhost:3000/api/verificar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correoActual, codigo })
            });
            const data = await res.json();

            if (!res.ok) return alert(data.error || 'Código incorrecto o expirado.');

            alert('Código verificado correctamente.');
            mostrarFormulario(formNueva);
        } catch (err) {
            console.error(err);
            alert('Error de conexión con el servidor.');
        }
    });

    // -----------------------------------------------
    // 3️⃣ Actualizar nueva contraseña
    // -----------------------------------------------
    formNueva.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevaContrasena = inputNuevaContrasena.value.trim();
        if (!nuevaContrasena) return alert('Por favor ingresa una nueva contraseña.');

        try {
            const res = await fetch('http://localhost:3000/api/cambiar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correoActual, nuevaContrasena })
            });
            const data = await res.json();

            if (!res.ok) return alert(data.error || 'No se pudo actualizar la contraseña.');

            alert('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.');
            window.location.href = 'iniciosesion.html';
        } catch (err) {
            console.error(err);
            alert('Error de conexión con el servidor.');
        }
    });

    // -----------------------------------------------
    // Función auxiliar para mostrar solo un formulario
    // -----------------------------------------------
    function mostrarFormulario(form) {
        [formCorreo, formCodigo, formNueva].forEach(f => f.classList.add('hidden'));
        form.classList.remove('hidden');
    }
});
