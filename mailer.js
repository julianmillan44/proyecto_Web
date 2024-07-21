const nodemailer = require('nodemailer');

// Configurar el transporter (esto dependerá de tu proveedor de correo)
const transporter = nodemailer.createTransport({
service:'Gmail',
  host: 'smtp.example.com',
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: 'julianocampomillan19@gmail.com',
    pass: 'fhyi bshj fyig vpcp'
  }
});

// Función para enviar correo
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"Tu Concesionario" <noreply@example.com>',
      to: to,
      subject: subject,
      text: text,
      html: html
    });
    console.log('Correo enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw error;
  }
}

module.exports = { sendEmail };