// src\bot.js
import { Telegraf, Markup } from 'telegraf';

export function startBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn('BOT_TOKEN topilmadi, bot ishga tushmadi.');
    return null;
  }

  const webAppUrl = process.env.WEBAPP_URL || 'https://jcute-snip-bot1.onrender.com';
  const adminId = String(process.env.ADMIN_TELEGRAM_ID || '719139730');
  const bot = new Telegraf(token);

  const appButton = Markup.keyboard([
    [Markup.button.webApp('✂️ jcute_snip — Navbat olish', webAppUrl)]
  ]).resize();

  bot.start((ctx) =>
    ctx.reply("Assalomu alaykum! jcute_snip online navbat tizimiga xush kelibsiz.\nЗдравствуйте! Добро пожаловать в jcute_snip.", appButton)
  );

  bot.command('admin', (ctx) =>
    String(ctx.from.id) === adminId
      ? ctx.reply('Admin panel Mini App ichida ochiladi.', appButton)
      : ctx.reply('Bu buyruq faqat admin uchun.')
  );

  bot.catch((err) => console.error('Bot xatosi:', err.message));

  bot
    .launch({ dropPendingUpdates: true })
    .catch((err) => console.error('Bot ishga tushmadi:', err.message));
  console.log('Telegram bot ishga tushirilmoqda...');

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
  return bot;
}