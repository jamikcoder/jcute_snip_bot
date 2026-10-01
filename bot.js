// src\bot.js
import 'dotenv/config';
import cron from 'node-cron';
import { Telegraf, Markup } from 'telegraf';
import { prisma } from './db.js';
import express from 'express';

const bot = new Telegraf(process.env.BOT_TOKEN);

const appButton = Markup.keyboard([
  [Markup.button.webApp('✂️ jcute_snip — Navbat olish', 'https://jcute-snip-bot1.onrender.com')]
]).resize();

bot.start((ctx) =>
  ctx.reply('Assalomu alaykum! jcute_snip online navbat tizimiga xush kelibsiz.', appButton)
);

bot.command('admin', (ctx) =>
  String(ctx.from.id) === String(process.env.ADMIN_TELEGRAM_ID)
    ? ctx.reply('Admin panel Mini App ichida ochiladi.', appButton)
    : ctx.reply('Bu buyruq faqat admin uchun.')
);

async function notify(text) {
  const users = await prisma.user.findMany({ select: { telegramId: true } });
  await Promise.allSettled(
    users.map((u) => bot.telegram.sendMessage(String(u.telegramId), text))
  );
}

cron.schedule(
  '0 10 * * *',
  async () => {
    try {
      const users = await prisma.user.findMany({
        include: {
          bookings: {
            where: { status: 'COMPLETED' },
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });

      const now = new Date();

      for (const user of users) {
        const last = user.bookings[0];
        if (last?.date) {
          const daysSince = Math.floor((now - last.date) / 86400000);
          if (daysSince === 20) {
            await bot.telegram.sendMessage(
              String(user.telegramId),
              "Oxirgi tashrifingizga 20 kun bo'ldi. Balki soch turmagingizni yangilash vaqti kelgandir? ✂️"
            );
          }
        }

        if (user.birthDate) {
          const birthMonth = user.birthDate.getUTCMonth();
          const birthDay = user.birthDate.getUTCDate();
          const nowMonth = now.getUTCMonth();
          const nowDay = now.getUTCDate();

          if (birthMonth === nowMonth && birthDay === nowDay) {
            await bot.telegram.sendMessage(
              String(user.telegramId),
              "Tug'ilgan kuningiz muborak, " + (user.firstName || 'mijoz') + '! 🎉'
            );
          }
        }
      }
    } catch (err) {
      console.error('Cron job xatosi:', err.message);
    }
  },
  { timezone: 'Asia/Tashkent' }
);

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('jcute-snip-bot is running live!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});