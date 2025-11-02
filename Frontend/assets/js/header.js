document.addEventListener('DOMContentLoaded', () => {
    const accionesUsuario = document.getElementById('acciones-usuario');
    const authToken = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');

    if (authToken && userName) {
        // Usuario logueado → mostrar icono + nombre
        accionesUsuario.insertAdjacentHTML('afterbegin', `
            <div class="usuario-logueado" id="usuario-dropdown">
                <div class="usuario-circular">${userName.charAt(0)}</div>
                <span class="usuario-nombre">${userName}</span>
                <div class="dropdown hidden">
                    <button id="logout-btn">Cerrar sesión</button>
                </div>
            </div>
        `);

        const dropdown = document.querySelector('#usuario-dropdown .dropdown');
        const usuarioDiv = document.getElementById('usuario-dropdown');

        usuarioDiv.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });

        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // ⬅️ Evita que el click cierre el dropdown antes de ejecutar logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            window.location.reload(); // recarga para volver a mostrar los botones
        });


    } else {
        // Usuario NO logueado → mostrar botones Registrarse / Acceder
        accionesUsuario.insertAdjacentHTML('afterbegin', `
            <a href="registrarse.html" class="btn">Registrarse</a>
            <a href="iniciosesion.html" class="btn">Acceder</a>
        `);
    }
});
