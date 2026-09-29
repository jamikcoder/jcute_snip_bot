import { prisma } from './db.js';

export async function sendTelegram(chatId, text) {
  if (!process.env.BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: String(chatId), text })
  });
}

export async function broadcast(text) {
  const users = await prisma.user.findMany({ select: { telegramId: true } });
  for (const user of users) {
    await sendTelegram(user.telegramId, text).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  return users.length;
}