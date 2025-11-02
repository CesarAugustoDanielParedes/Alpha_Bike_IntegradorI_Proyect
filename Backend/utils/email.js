// utils/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // puedes usar outlook o smtp personalizado
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo(destinatario, asunto, htmlContenido) {
  await transporter.sendMail({
    from: `"Alpha Bike" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: asunto,
    html: htmlContenido
  });
}

module.exports = { enviarCorreo };
