type ResetEmailParams = {
  to: string;
  resetUrl: string;
};

// Simple stub for sending password reset email.
// Replace with real SMTP/Nodemailer provider when available.
export const sendPasswordResetEmail = async ({ to, resetUrl }: ResetEmailParams) => {
  console.log(`[email] Enviar enlace de recuperación a ${to}: ${resetUrl}`);
};
