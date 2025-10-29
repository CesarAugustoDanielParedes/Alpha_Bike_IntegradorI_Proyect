<form action="actualizar-password" method="post">
  <input type="hidden" name="correo" value="${param.correo}">
  <label>Código recibido:</label>
  <input type="text" name="codigo" required><br>

  <label>Nueva contraseña:</label>
  <input type="password" name="nuevaContrasena" required><br>

  <button type="submit">Actualizar contraseña</button>
</form>
