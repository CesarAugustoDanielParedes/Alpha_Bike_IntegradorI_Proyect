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
    // 👁️ Función para mostrar/ocultar contraseña
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

// 🚪 Manejo del submit para login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = e.target.correo.value.trim();
  const contrasena = e.target.contrasena.value.trim();

  console.log('Datos enviados:', correo, contrasena); // depurar

  try {
    const resp = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await resp.json();

    if (resp.ok) {
      alert('✅ Inicio de sesión exitoso');
      window.location.href = 'inicio.html';
    } else {
      alert('❌ ' + data.error);
    }
  } catch (err) {
    alert('Error de red: ' + err.message);
  }
});
