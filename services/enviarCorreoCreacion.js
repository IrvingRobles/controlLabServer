const nodemailer = require("nodemailer");
require("dotenv").config();

// 🚀 Configuración del transporte
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// 📨 FUNCIÓN 2: Correo de Creación de Registro
async function enviarCorreoCreacion(correo, usuario) {
    if (!correo) {
        console.error("❌ Error: No hay destinatario para el correo.");
        throw new Error("No se pudo enviar el correo porque el destinatario está vacío.");
    }

    console.log(`📩 Enviando correo de creación a: ${correo} | Registro ID: ${usuario.registroId}`);

    const mailOptions = {
        from: `"ControlLab" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: "Nueva Solicitud Creada",
        attachments: [{
            filename: 'logo.png',
            path: './views/img/logo.jpg',
            cid: 'logo'
        }],
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" 
                style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
                
                <tr><td align="center"><img src="cid:logo" alt="ControlLab Logo" width="120" style="margin-bottom: 15px;"></td></tr>

                <tr><td align="center" style="font-size: 22px; font-weight: bold; color: #28a745; padding-bottom: 10px;">
                    Nueva Solicitud Creada
                </td></tr>

                <tr><td style="padding: 15px; font-size: 16px; color: #333;">
                    <p>Hola <strong>${usuario.nombre}</strong>,</p>
                    <p>Se ha creado una nueva solicitud con los siguientes detalles:</p>

                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 10px; font-size: 15px;">
                        <tr style="background-color: #28a745; color: #ffffff;">
                            <th style="text-align: left; padding: 10px;">Campo</th>
                            <th style="text-align: left; padding: 10px;">Datos de solicitud</th>
                        </tr>
                        <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">ID Registro</td><td style="padding: 8px;">${usuario.registroId}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Clave</td><td style="padding: 8px;">${usuario.clave}</td></tr>
                        <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Empresa</td><td style="padding: 8px;">${usuario.empresa}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Descripción</td><td style="padding: 8px;">${usuario.descripcion}</td></tr>
                        <tr style="background-color: #f9f9f9;"><td style="padding: 8px; font-weight: bold;">Contacto</td><td style="padding: 8px;">${usuario.contacto}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Creado por</td><td style="padding: 8px;">${usuario.username}</td></tr>
                    </table>

                    <p style="margin-top: 20px; text-align: center; font-size: 14px;">
                        <strong>Revisa el sistema para más información.</strong>
                    </p>
                </td></tr>

                <tr><td align="center" style="padding: 10px; font-size: 14px; color: #666;">
                    <p>&copy; 2024 ControlLab. Todos los derechos reservados.</p>
                </td></tr>
            </table>
        </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo de creación enviado a ${correo} | ID Mensaje: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error al enviar correo de creación:", error);
        throw new Error("No se pudo enviar el correo de creación.");
    }
}
module.exports = { enviarCorreoCreacion };
