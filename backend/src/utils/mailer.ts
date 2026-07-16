import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendStreakReminder = async (to: string, name: string, streak: number) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from: `"LingoAlb 🇦🇱" <${process.env.EMAIL_USER}>`,
    to,
    subject: streak > 0 ? `Mos e humb streak-un tënd 🔥 (${streak} ditë)` : 'Kthehu te LingoAlb sot! 📚',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0F172A;color:#F1F5F9;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#1B4FD8,#E63946);padding:32px;text-align:center">
          <div style="font-size:48px">🇦🇱</div>
          <h1 style="margin:12px 0 0;font-size:28px;font-weight:800">LingoAlb</h1>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 12px">Përshëndetje, ${name}! 👋</h2>
          ${streak > 0
            ? `<p style="color:#FFA500;font-size:20px;font-weight:700">🔥 Serie: ${streak} ditë radhazi</p>
               <p style="color:#94A3B8">Mos e humb streak-un tënd të mrekullueshëm! Vetëm 5 minuta sot për ta vazhduar progresin.</p>`
            : `<p style="color:#94A3B8">Ke qenë munguar pak kohë. Rikthehu sot dhe rifillo udhëtimin tënd gjuhësor!</p>`
          }
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
             style="display:inline-block;margin-top:24px;padding:14px 28px;background:#1B4FD8;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">
            Fillo mësimin tani →
          </a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #1E293B;text-align:center;color:#475569;font-size:12px">
          LingoAlb — Mëso gjuhë të huaja përmes shqipes 🇦🇱
        </div>
      </div>`,
  });
};
