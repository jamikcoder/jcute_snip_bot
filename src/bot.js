import 'dotenv/config';
import cron from 'node-cron';
import { Telegraf, Markup } from 'telegraf';
import { prisma } from './db.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module muhitida __dirname o'rnini bosuvchi o'zgaruvchilar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Telegram Bot sozlamalari
const bot = new Telegraf(process.env.BOT_TOKEN);

// Web App tugmasi
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://jcute-snip-bot.onrender.com';
const appButton = Markup.keyboard([
  [Markup.button.webApp('✂️ jcute_snip — Navbat olish', WEBAPP_URL)]
]).resize();

bot.start((ctx) =>
  ctx.reply('Assalomu alaykum! jcute_snip online navbat tizimiga xush kelibsiz.', appButton)
);

// Botni ishga tushirish (Long Polling)
bot.launch().then(() => {
  console.log('Bot muvaffaqiyatli ishga tushdi!');
});

// 2. Express Web Server sozlamalari (Render Port-Binding va Web App uchun)
const app = express();
const PORT = process.env.PORT || 3000;

// Loyiha ildiz papkasidagi (root) statik fayllarni ochiqlash (CSS, JS, images)
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// Web App uchun index.html faylini yuborish
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda tinglamoqda...`);
});

// Process toxtaganda botni xavfsiz to'xtatish
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));