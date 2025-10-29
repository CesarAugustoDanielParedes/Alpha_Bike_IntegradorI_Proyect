
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = e.target.correo.value.trim();
  const contrasena = e.target.contrasena.value.trim();

  try {
const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });

    const data = await resp.json();

    if (resp.ok) {
      alert('✅ Inicio de sesión exitoso');
      // Redirigir al usuario, por ejemplo:
      window.location.href = 'inicio.html';
    } else {
      alert('❌ ' + data.error);
    }
  } catch (err) {
    alert('Error de red: ' + err.message);
  }
});
