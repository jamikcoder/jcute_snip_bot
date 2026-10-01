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

// Root (loyihaning asosiy) papkasi va src papkasi yo'llari
const rootDir = path.resolve(__dirname, '..');

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

// Hamma statik fayllarni (CSS, JS, rasm) ochiqlash
app.use(express.static(rootDir));
app.use(express.static(__dirname));

// Bosh sahifaga kirilganda (Web App ochiqganda) index.html yuborish
app.get('/', (req, res) => {
  const rootIndexPath = path.join(rootDir, 'index.html');
  const srcIndexPath = path.join(__dirname, 'index.html');

  if (fs.existsSync(rootIndexPath)) {
    res.sendFile(rootIndexPath);
  } else if (fs.existsSync(srcIndexPath)) {
    res.sendFile(srcIndexPath);
  } else {
    res.status(404).send('xatolik: index.html fayli topilmadi! Iltimos, fayl nomini va joylashuvini tekshiring.');
  }
});

app.listen(PORT, () => {
  console.log(`Express Server ${PORT}-portda tinglamoqda...`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));