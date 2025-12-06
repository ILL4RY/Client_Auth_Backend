import nodemailer from "nodemailer";

type ResetEmailParams = {
  to: string;
  resetUrl: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;

const hasSmtpConfig = smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom;

export const sendPasswordResetEmail = async ({ to, resetUrl }: ResetEmailParams) => {
  if (!hasSmtpConfig) {
    console.log(`[email] (stub) Enviar enlace de recuperación a ${to}: ${resetUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: "Recupera tu contraseña",
    text: `Hola,

Has solicitado restablecer tu contraseña. Usa este enlace para continuar:
${resetUrl}

Si no fuiste tú, ignora este mensaje.`,
    html: `
      <p>Hola,</p>
      <p>Has solicitado restablecer tu contraseña. Usa este enlace para continuar:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no fuiste tú, ignora este mensaje.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
