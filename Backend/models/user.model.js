// models/user.model.js

// DTO para manejar la solicitud de registro de clientes
class RegisterDTO {
    constructor({ nombre, apellido, telefono, correo, contrasena }) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.correo = correo;
        this.contrasena = contrasena;
    }
}

module.exports = { RegisterDTO };