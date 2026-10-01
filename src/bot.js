import 'dotenv/config';
import cron from 'node-cron';
import { Telegraf, Markup } from 'telegraf';
import { prisma } from './db.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Telegram Bot sozlamalari
const bot = new Telegraf(process.env.BOT_TOKEN);

const WEBAPP_URL = process.env.WEBAPP_URL || 'https://jcute-snip-bot.onrender.com';
const appButton = Markup.keyboard([
  [Markup.button.webApp('✂️ jcute_snip — Navbat olish', WEBAPP_URL)]
]).resize();

bot.start((ctx) =>
  ctx.reply('Assalomu alaykum! jcute_snip online navbat tizimiga xush kelibsiz.', appButton)
);

bot.launch().then(() => {
  console.log('Bot muvaffaqiyatli ishga tushdi!');
});

// 2. Express Web Server sozlamalari
const app = express();
const PORT = process.env.PORT || 3000;

// Loyihaning asosiy papkasi (root)
const rootDir = path.resolve(__dirname, '..');

// Statik fayllarni ulash (index.html, style.css, app.js)
app.use(express.static(rootDir));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const rootIndexPath = path.join(rootDir, 'index.html');
  const srcIndexPath = path.join(__dirname, 'index.html');

  // index.html qaysi papkada bo'lishidan qat'i nazar uni topadi
  if (fs.existsSync(rootIndexPath)) {
    res.sendFile(rootIndexPath);
  } else if (fs.existsSync(srcIndexPath)) {
    res.sendFile(srcIndexPath);
  } else {
    res.send('index.html topilmadi. Iltimos, fayl loyiha papkasida borligini tekshiring.');
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda tinglamoqda...`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));