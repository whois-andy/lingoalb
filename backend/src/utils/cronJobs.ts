import cron from 'node-cron';
import { User } from '../models/User';
import { sendStreakReminder } from './mailer';

export const startCronJobs = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured — streak reminders disabled. Set EMAIL_USER and EMAIL_PASS to enable.');
    return;
  }

  // Daily at 09:00 — remind users who haven't been active today
  cron.schedule('0 9 * * *', async () => {
    console.log('📧 Running daily streak reminder job...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const inactiveUsers = await User.find({
        role: 'student',
        email: { $exists: true },
        $or: [
          { lastActiveDate: { $lt: yesterday } },
          { lastActiveDate: null },
        ],
      }).select('name email streak').limit(500);

      let sent = 0;
      for (const user of inactiveUsers) {
        try {
          await sendStreakReminder(user.email, user.name, user.streak || 0);
          sent++;
        } catch {}
      }
      console.log(`📧 Sent ${sent} streak reminder emails`);
    } catch (err) {
      console.error('❌ Cron job error:', err);
    }
  }, { timezone: 'Europe/Tirane' });

  console.log('⏰ Cron jobs started (streak reminders at 09:00 Tirana time)');
};
