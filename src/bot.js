import 'dotenv/config';
import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root va public papkalari yo'li
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// 1. Telegram Bot sozlamalari
const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://jcute-snip-bot1.onrender.com';

const appButton = Markup.keyboard([
  [Markup.button.webApp('✂️ jcute_snip — Navbat olish', WEBAPP_URL)]
]).resize();

bot.start((ctx) => {
  return ctx.reply('Assalomu alaykum! jcute_snip online navbat tizimiga xush kelibsiz.', appButton);
});

bot.launch().then(() => {
  console.log('Telegram Bot muvaffaqiyatli ishga tushdi!');
});

// 2. Express Web Server sozlamalari
const app = express();
const PORT = process.env.PORT || 3000;

// Public va Root papkalardagi tumanga mos statik fayllarni (CSS, JS, images) ulash
app.use(express.static(publicDir));
app.use(express.static(rootDir));
app.use(express.static(__dirname));

// Web App ochilganda public/index.html faylini yuborish
app.get('/', (req, res) => {
  const publicIndexPath = path.join(publicDir, 'index.html');
  const rootIndexPath = path.join(rootDir, 'index.html');

  if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else if (fs.existsSync(rootIndexPath)) {
    res.sendFile(rootIndexPath);
  } else {
    res.status(404).send('xatolik: index.html fayli public/ yoki root papkadan topilmadi!');
  }
});

app.listen(PORT, () => {
  console.log(`Express Server ${PORT}-portda tinglamoqda...`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));