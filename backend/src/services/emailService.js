const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const enviarResetSenha = async (email, nome, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-senha?token=${token}`;
  await transporter.sendMail({
    from: `"StreamFlix" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Recuperação de Senha - StreamFlix',
    html: `
      <div style="font-family: Arial; background:#141414; color:#fff; padding:40px; max-width:500px; margin:0 auto; border-radius:8px;">
        <h2 style="color:#e50914;">StreamFlix</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo:</p>
        <a href="${url}" style="display:inline-block;background:#e50914;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Redefinir Senha
        </a>
        <p style="color:#999;font-size:12px;">Este link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
      </div>
    `,
  });
};

module.exports = { enviarResetSenha };
