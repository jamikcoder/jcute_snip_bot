import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cron from 'node-cron';
import { prisma } from './db.js';
import { SERVICES, totalFor } from './catalog.js';
import { availableSlots, dayToUtc, toTime, validateSlot } from './schedule.js';
import { broadcast, sendTelegram } from './telegram.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
const isAdmin = (req) => String(req.header('x-telegram-id')) === String(process.env.ADMIN_TELEGRAM_ID);
const dateKey = (date) => date.toISOString().slice(0, 10);
const tzDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const publicBooking = (booking) => ({ ...booking, services: JSON.parse(booking.services) });

app.get('/api/config', (_req, res) => res.json({ services: SERVICES, card: '9860 0201 2138 9496', cardOwner: 'Jamshid Boishov', locationUrl: 'https://www.google.com/maps/search/?api=1&query=Aura+Beauty+Studio+Almalyk' }));
app.get('/api/slots', async (req, res) => {
  try {
    const { date, services = '' } = req.query;
    const totals = totalFor(String(services).split(',').filter(Boolean));
    const bookings = await prisma.booking.findMany({ where: { date: dayToUtc(date) } });
    res.json({ slots: availableSlots(bookings, totals.minutes), ...totals });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/register', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, phone, birthDate } = req.body;
    if (!telegramId || !firstName || !lastName || !phone || !birthDate) throw new Error('Barcha ro‘yxatdan o‘tish maydonlarini to‘ldiring.');
    const user = await prisma.user.upsert({ where: { telegramId: BigInt(telegramId) }, update: { firstName, lastName, phone, birthDate: new Date(birthDate) }, create: { telegramId: BigInt(telegramId), firstName, lastName, phone, birthDate: new Date(birthDate) } });
    res.json({ user: { ...user, telegramId: user.telegramId.toString() } });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.post('/api/bookings', async (req, res) => {
  try {
    const { telegramId, date, startTime, services, paymentMethod, contactPhone } = req.body;
    const totals = totalFor(services || []);
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user) throw new Error('Avval ro‘yxatdan o‘ting.');
    if (!['CASH', 'CARD'].includes(paymentMethod)) throw new Error('To‘lov turini tanlang.');
    const dateValue = dayToUtc(date);
    const dayBookings = await prisma.booking.findMany({ where: { date: dateValue } });
    if (!validateSlot(dayBookings, startTime, totals.minutes)) throw new Error('Bu vaqt hozir band. Boshqasini tanlang.');
    const start = startTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
    const booking = await prisma.booking.create({ data: { userId: user.id, date: dateValue, startTime, endTime: toTime(start + totals.minutes), services: JSON.stringify(services), totalPrice: totals.price, totalMinutes: totals.minutes, paymentMethod, contactPhone } });
    res.status(201).json({ booking: publicBooking(booking) });
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/me/:telegramId', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(req.params.telegramId) }, include: { bookings: { orderBy: [{ date: 'desc' }, { startTime: 'desc' }] } } });
  if (!user) return res.status(404).json({ error: 'Profil topilmadi.' });
  const completed = user.bookings.filter((b) => b.status === 'COMPLETED');
  const attended = user.bookings.filter((b) => ['COMPLETED', 'BOOKED'].includes(b.status)).length;
  const allPast = user.bookings.filter((b) => ['COMPLETED', 'NO_SHOW'].includes(b.status)).length;
  res.json({ user: { ...user, telegramId: user.telegramId.toString(), bookings: user.bookings.map(publicBooking) }, visits: completed.length, spent: completed.reduce((sum, b) => sum + b.totalPrice, 0), reliability: allPast ? Math.round((attended / allPast) * 100) : 100 });
});
app.get('/api/day/:date', async (req, res) => {
  const rows = await prisma.booking.findMany({ where: { date: dayToUtc(req.params.date) }, include: { user: true }, orderBy: { startTime: 'asc' } });
  res.json(rows.map((row) => ({ ...publicBooking(row), user: { ...row.user, telegramId: row.user.telegramId.toString() } })));
});
app.post('/api/bookings/:id/cancel', async (req, res) => {
  try {
    if (!req.body.reason?.trim()) throw new Error('Bekor qilish sababini yozing.');
    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', cancellationReason: req.body.reason.trim() } });
    await sendTelegram(process.env.ADMIN_TELEGRAM_ID, `❗ Navbat bekor qilindi\nSana: ${dateKey(booking.date)} ${booking.startTime}\nSabab: ${booking.cancellationReason}`);
    await broadcast(`✂️ Bo‘sh vaqt ochildi! ${dateKey(booking.date)} kuni soat ${booking.startTime} dagi navbat bekor qilindi. Hozir band qilishingiz mumkin.`);
    res.json(publicBooking(booking));
  } catch (error) { res.status(400).json({ error: error.message }); }
});
app.get('/api/admin/overview', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
  const today = dayToUtc(tzDate()); const month = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const [todayBookings, monthBookings] = await Promise.all([prisma.booking.findMany({ where: { date: today, status: 'COMPLETED' } }), prisma.booking.findMany({ where: { date: { gte: month }, status: 'COMPLETED' } })]);
  const income = (list) => list.reduce((sum, b) => sum + b.totalPrice, 0);
  res.json({ todayClients: todayBookings.length, todayIncome: income(todayBookings), monthClients: monthBookings.length, monthIncome: income(monthBookings) });
});
app.patch('/api/admin/bookings/:id/status', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
  const status = req.body.status;
  if (!['BOOKED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].includes(status)) return res.status(400).json({ error: 'Noto‘g‘ri holat.' });
  res.json(await prisma.booking.update({ where: { id: req.params.id }, data: { status } }));
});
app.post('/api/admin/broadcast', async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
  if (!req.body.text?.trim()) return res.status(400).json({ error: 'Xabar matnini kiriting.' });
  res.json({ deliveredTo: await broadcast(req.body.text.trim()) });
});

// Reminders are sent by bot.js through the shared database every day at 10:00.
cron.schedule('0 10 * * *', () => console.log('Reminder job: run `npm run bot` in the same deployment.'), { timezone: 'Asia/Tashkent' });
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.listen(process.env.PORT || 3000, () => console.log(`jcute_snip API: http://localhost:${process.env.PORT || 3000}`));
