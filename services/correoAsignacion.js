const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function enviarCorreoAsignacion(correo, usuario) {
    if (!correo) {
        console.error("❌ Error: No hay destinatario para el correo.");
        throw new Error("No se pudo enviar el correo porque el destinatario está vacío.");
    }

    console.log(`📩 Enviando correo a: ${correo} | Usuario: ${usuario.username} | Registro ID: ${usuario.registroId}`);

    const mailOptions = {
        from: `"ControlLab" <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: "Asignación de Registro",
        attachments: [{
            filename: 'logo.png',
            path: './views/img/logo.jpg', // Reemplázalo con la ruta real de tu logo
            cid: 'logo' // ID para referenciarlo en el HTML
        }],
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" 
                style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px;">
                
                <!-- Logo -->
                <tr>
                    <td align="center">
                        <img src="cid:logo" alt="ControlLab Logo" width="120" style="margin-bottom: 15px;">
                    </td>
                </tr>

                <!-- Título -->
                <tr>
                    <td align="center" style="font-size: 22px; font-weight: bold; color: #007bff; padding-bottom: 10px;">
                        Asignación de Registro
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding: 15px; font-size: 16px; color: #333;">
                        <p>Hola <strong>${usuario.nombre}</strong>,</p>
                        <p>Se te ha asignado el siguiente registro:</p>

                        <!-- Tabla de información -->
                        <table width="100%" cellpadding="8" cellspacing="0" 
                            style="border-collapse: collapse; margin-top: 10px; font-size: 15px;">
                            
                            <tr style="background-color: #007bff; color: #ffffff;">
                                <th style="text-align: left; padding: 10px; border-radius: 5px 5px 0 0;">Campo</th>
                                <th style="text-align: left; padding: 10px; border-radius: 5px 5px 0 0;">Datos de solicitud</th>
                            </tr>

                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 8px; font-weight: bold;">ID Registro</td>
                                <td style="padding: 8px;">${usuario.registroId}</td>
                            </tr>
                            <tr style="background-color: #ffffff;">
                                <td style="padding: 8px; font-weight: bold;">Clave</td>
                                <td style="padding: 8px;">${usuario.clave}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 8px; font-weight: bold;">Empresa</td>
                                <td style="padding: 8px;">${usuario.empresa}</td>
                            </tr>
                            <tr style="background-color: #ffffff;">
                                <td style="padding: 8px; font-weight: bold;">Descripción</td>
                                <td style="padding: 8px;">${usuario.descripcion}</td>
                            </tr>
                            <tr style="background-color: #f9f9f9;">
                                <td style="padding: 8px; font-weight: bold;">Contacto</td>
                                <td style="padding: 8px;">${usuario.contacto}</td>
                            </tr>
                            <tr style="background-color: #ffffff;">
                                <td style="padding: 8px; font-weight: bold;">Usuario Asignado</td>
                                <td style="padding: 8px;">${usuario.username}</td>
                            </tr>
                        </table>

                        <p style="margin-top: 20px; text-align: center; font-size: 14px;">
                            <strong>Por favor, revisa el sistema para más detalles.</strong>
                        </p>
                    </td>
                </tr>

                <!-- Pie de página -->
                <tr>
                    <td align="center" style="padding: 10px; font-size: 14px; color: #666;">
                        <p>&copy; 2024 ControlLab. Todos los derechos reservados.</p>
                    </td>
                </tr>
            </table>
        </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado con éxito a ${correo} | ID Mensaje: ${info.messageId}`);
    } catch (error) {
        console.error("❌ Error al enviar el correo:", error);
        throw new Error("No se pudo enviar el correo de asignación.");
    }
}

// Exportar la función correctamente
module.exports = { enviarCorreoAsignacion };
