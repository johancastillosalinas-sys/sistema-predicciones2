import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, token, invitedBy, origin } = body;

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos (email o token).' },
        { status: 400 }
      );
    }

    const inviteUrl = `${origin || 'http://localhost:3000'}/invite?token=${token}`;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Check if real SMTP credentials are set
    if (!emailUser || !emailPass) {
      return NextResponse.json({
        success: false,
        requiresConfig: true,
        inviteUrl,
        error: 'Las credenciales de correo (EMAIL_USER y EMAIL_PASS) aún no están configuradas en el archivo .env.local.',
      });
    }

    // Configure Nodemailer transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s+/g, ''), // remove any accidental spaces in app password
      },
    });

    const roleName = role === 'ADMIN' ? 'Administrador' : role === 'EDITOR' ? 'Tasador / Editor' : 'Inversionista (Lector)';

    // Professional HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b101b; color: #f1f5f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background-color: #111827; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1d4ed8, #059669); padding: 30px 25px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #d1fae5; margin: 6px 0 0 0; font-size: 13px; }
        .body { padding: 30px 25px; }
        .body p { font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 0; }
        .badge-box { background-color: #0d131f; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; margin: 20px 0; }
        .badge-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; }
        .badge-value { font-size: 15px; color: #38bdf8; font-weight: bold; margin-top: 3px; }
        .cta-btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #2563eb; color: #ffffff !important; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: bold; text-decoration: none; margin: 25px 0 15px 0; }
        .cta-btn:hover { background: #1d4ed8; }
        .footer { border-top: 1px solid #1e293b; padding: 20px 25px; font-size: 12px; color: #64748b; text-align: center; }
        .footer a { color: #38bdf8; text-decoration: none; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>InmoPredict Hub</h1>
          <p>Central de Información & Predicción Inmobiliaria</p>
        </div>
        <div class="body">
          <p>Hola,</p>
          <p><strong>${invitedBy}</strong> te ha invitado a unirte y colaborar en la plataforma privada de <strong>InmoPredict Hub</strong>.</p>
          
          <div class="badge-box">
            <div class="badge-label">Rol Asignado</div>
            <div class="badge-value">${roleName}</div>
          </div>

          <p>Al unirte, tendrás acceso a los modelos de tasación por metro cuadrado, análisis de datasets con gráficos de dispersión y la biblioteca de informes técnicos en Markdown con historial de versiones.</p>

          <a href="${inviteUrl}" target="_blank" class="cta-btn">
            Aceptar Invitación y Activar Acceso
          </a>

          <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
            Si el botón no funciona en tu correo, copia y pega este enlace directo en tu navegador:<br>
            <a href="${inviteUrl}" style="color: #38bdf8; font-size: 11px;">${inviteUrl}</a>
          </p>
        </div>
        <div class="footer">
          Este enlace de un solo uso es válido por 7 días. Si no esperabas esta invitación, puedes ignorar este mensaje.
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"InmoPredict Hub" <${emailUser}>`,
      to: email,
      subject: `${invitedBy} te ha invitado a InmoPredict Hub (Acceso como ${roleName})`,
      html: htmlContent,
      text: `Hola, ${invitedBy} te ha invitado a colaborar en InmoPredict Hub con rol ${roleName}. Abre este enlace para unirte: ${inviteUrl}`,
    });

    return NextResponse.json({
      success: true,
      deliveredTo: email,
      message: `¡Correo de invitación enviado con éxito a ${email}!`,
    });
  } catch (error: unknown) {
    console.error('Error al enviar correo con Nodemailer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar correo';
    return NextResponse.json(
      {
        success: false,
        error: `No se pudo enviar el correo: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
