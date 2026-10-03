import { prisma } from './db.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendTelegram(chatId, text) {
  if (!process.env.BOT_TOKEN || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: String(chatId), text })
    });
  } catch (e) {
    console.error('Telegram yuborish xatosi:', e.message);
  }
}

// Hammaga bir xil matn
export async function broadcast(text) {
  const users = await prisma.user.findMany({ select: { telegramId: true } });
  for (const user of users) {
    await sendTelegram(user.telegramId, text);
    await sleep(50);
  }
  return users.length;
}

// Har bir foydalanuvchiga o'zi tanlagan tilda
export async function broadcastLang(uz, ru, excludeTgId = null) {
  const users = await prisma.user.findMany({ select: { telegramId: true, lang: true } });
  let sent = 0;
  for (const user of users) {
    if (excludeTgId !== null && String(user.telegramId) === String(excludeTgId)) continue;
    await sendTelegram(user.telegramId, user.lang === 'ru' ? ru : uz);
    sent++;
    await sleep(50);
  }
  return sent;
}