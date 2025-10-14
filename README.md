AlphaBike - Proyecto Spring Boot (migrado desde Node.js)
=========================================================

Contenido:
- Backend: Spring Boot + JdbcTemplate (Java 21)
- Frontend: copiado desde tu proyecto original en /src/main/resources/static

Requisitos:
- Java 21 instalado
- Maven instalado
- SQL Server (AlphaBikeDB) disponible en localhost:1433
- Usuario: sa  Password: 123456789

Ejecutar:
1. Importar la base de datos (si no existe) usando tus scripts SQL.
2. En la carpeta del proyecto ejecutar:
   mvn spring-boot:run
3. Abrir: http://localhost:3000/

Endpoints:
- POST /api/registro  { nombre, correo, contrasena }
- POST /api/login     { correo, contrasena }
- GET  /api/productos

Notas:
- Las contraseñas se guardan con BCrypt.
- Si tu tabla Usuarios tiene columnas diferentes (nombres distintos), ajusta las queries en UsuarioController.java.
