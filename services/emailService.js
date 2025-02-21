const nodemailer = require('nodemailer');
require('dotenv').config(); // Cargar variables de entorno

// Configurar el transporte SMTP con Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Correo de envío
        pass: process.env.EMAIL_PASS  // Contraseña o "Contraseña de Aplicaciones"
    }
});

// Ruta absoluta del logo (asegúrate de que el servidor puede acceder a esta imagen)
const logoUrl = 'cid:logo';

// Función para enviar el correo de verificación con los datos del usuario en tabla
const enviarCorreoValidacion = async (correo, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, domicilio, nss, ingreso, password, telefono, token) => {
    try {
        const mailOptions = {
            from: `"ControlLab" <${process.env.EMAIL_USER}>`, // Nombre del remitente
            to: correo, // Correo del destinatario
            subject: 'Verificación de cuenta - ControlLab',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <img src="${logoUrl}" alt="ControlLab Logo" width="150" style="margin-bottom: 20px;">
                    <h2 style="color: #333;">Bienvenido a ControlLab, ${nombre}!</h2>
                    <p style="font-size: 16px; color: #666;">Gracias por registrarte. Aquí están los datos que ingresaste:</p>
                    
                    <table style="width: 100%; max-width: 600px; margin: auto; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background-color: #f8f8f8;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Campo</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Información</th>
                        </tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Nombre</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${nombre}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Usuario</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${username}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>RFC</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${rfc}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>CURP</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${curp}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Departamento</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${departamento}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Puesto</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${puesto}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Contrato</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${contrato}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Jornada</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${jornada}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Domicilio</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${domicilio}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>NSS</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${nss}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Fecha de ingreso</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${ingreso}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Teléfono</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${telefono}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Correo</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${correo}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Contraseña</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${password}</td></tr>
                    </table>

                    <p style="margin-top: 20px; font-size: 16px; color: #666;">Para verificar tu cuenta, haz clic en el siguiente botón:</p>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                    <a href="http://localhost:3000/api/login/validar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">Verificar cuenta</a>
=======
                    <a href="https://controllabserver.onrender.com/api/login/validar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">Verificar cuenta</a>
>>>>>>> def00b5 (commit perfiles)
=======
                    <a href="http://localhost:3000/api/login/validar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">Verificar cuenta</a>
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======
                    <a href="http://localhost:3000/api/login/validar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: #fff; text-decoration: none; font-weight: bold; border-radius: 5px;">Verificar cuenta</a>
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #999;">Si no solicitaste este registro, ignora este correo.</p>
                </div>
            `,
            attachments: [{
                filename: 'logo.jpg',
                path: __dirname + '/../views/img/logo.jpg', // Ruta al logo
                cid: 'logo' // Identificador del logo para incrustarlo en el correo
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado a:', correo);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo de verificación.');
    }
};

module.exports = enviarCorreoValidacion;
