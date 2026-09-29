// src\server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

function safeBigInt(value) {
  try { return BigInt(value); } catch { return null; }
}

function isValidDateString(str) {
  if (!str || typeof str !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00.000Z');
  return !isNaN(d.getTime());
}

function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return /^\+?[\d\s\-()]{7,20}$/.test(phone.trim());
}

// ===== PUBLIC API =====

app.get('/api/config', (_req, res) => {
  res.json({
    services: SERVICES,
    card: '9860 0201 2138 9496',
    cardOwner: 'Jamshid Boishov',
    locationUrl: 'https://www.google.com/maps/search/?api=1&query=Aura+Beauty+Studio+Almalyk',
    adminId: process.env.ADMIN_TELEGRAM_ID
  });
});

app.get('/api/slots', async (req, res) => {
  try {
    const { date, services } = req.query;
    if (!date || !isValidDateString(date)) {
      return res.status(400).json({ error: "Sana noto'g'ri formatda." });
    }

    const dayOff = await prisma.dayOff.findUnique({ where: { date: dayToUtc(date) } });
    if (dayOff) {
      return res.json({ slots: [], price: 0, minutes: 0, dayOff: true, reason: dayOff.reason });
    }

    const serviceIds = services && String(services).trim() && String(services).trim() !== 'undefined'
      ? String(services).split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const totals = totalFor(serviceIds);
    const bookings = await prisma.booking.findMany({ where: { date: dayToUtc(date) } });
    res.json({ slots: availableSlots(bookings, totals.minutes), ...totals });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, phone, birthDate } = req.body;
    if (!telegramId || !firstName || !lastName || !phone || !birthDate) {
      throw new Error("Barcha maydonlarni to'ldiring.");
    }

    const tgId = safeBigInt(telegramId);
    if (!tgId) throw new Error("Telegram ID noto'g'ri.");
    if (!isValidPhone(phone)) throw new Error("Telefon raqami noto'g'ri.");

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) throw new Error("Tug'ilgan sana noto'g'ri.");

    const user = await prisma.user.upsert({
      where: { telegramId: tgId },
      update: { firstName, lastName, phone, birthDate: birth },
      create: { telegramId: tgId, firstName, lastName, phone, birthDate: birth }
    });

    res.json({ user: { ...user, telegramId: user.telegramId.toString() } });
    } catch (error) {
    console.error('Register xatosi:', error);
    res.status(400).json({ error: error.message || "Server xatosi" });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { telegramId, date, startTime, services, paymentMethod, contactPhone } = req.body;

    const tgId = safeBigInt(telegramId);
    if (!tgId) throw new Error("Telegram ID noto'g'ri.");
    if (!date || !isValidDateString(date)) throw new Error("Sana noto'g'ri.");
    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) throw new Error("Vaqt noto'g'ri.");
    if (!Array.isArray(services) || services.length === 0) throw new Error('Kamida bitta xizmat tanlang.');
    if (!contactPhone || !isValidPhone(contactPhone)) throw new Error("Aloqa telefoni noto'g'ri.");

    const dayOff = await prisma.dayOff.findUnique({ where: { date: dayToUtc(date) } });
    if (dayOff) throw new Error('Bu kun dam olish kuni.');

    const totals = totalFor(services);
    const user = await prisma.user.findUnique({ where: { telegramId: tgId } });
    if (!user) throw new Error("Avval ro'yxatdan o'ting.");
    if (!['CASH', 'CARD'].includes(paymentMethod)) throw new Error("To'lov turini tanlang.");

    const dateValue = dayToUtc(date);
    const dayBookings = await prisma.booking.findMany({ where: { date: dateValue } });

    if (!validateSlot(dayBookings, startTime, totals.minutes)) {
      throw new Error('Bu vaqt band. Boshqasini tanlang.');
    }

    const start = startTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        date: dateValue,
        startTime,
        endTime: toTime(start + totals.minutes),
        services: JSON.stringify(services),
        totalPrice: totals.price,
        totalMinutes: totals.minutes,
        paymentMethod,
        contactPhone
      }
    });

    res.status(201).json({ booking: publicBooking(booking) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/me/:telegramId', async (req, res) => {
  try {
    const tgId = safeBigInt(req.params.telegramId);
    if (!tgId) return res.status(400).json({ error: "Telegram ID noto'g'ri." });

    const user = await prisma.user.findUnique({
      where: { telegramId: tgId },
      include: { bookings: { orderBy: [{ date: 'desc' }, { startTime: 'desc' }] } }
    });

    if (!user) return res.status(404).json({ error: 'Profil topilmadi.' });

    const completed = user.bookings.filter((b) => b.status === 'COMPLETED');
    const attended = user.bookings.filter((b) => ['COMPLETED', 'BOOKED'].includes(b.status)).length;
    const allPast = user.bookings.filter((b) => ['COMPLETED', 'NO_SHOW'].includes(b.status)).length;

    res.json({
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
        bookings: user.bookings.map(publicBooking)
      },
      visits: completed.length,
      spent: completed.reduce((sum, b) => sum + b.totalPrice, 0),
      reliability: allPast ? Math.round((attended / allPast) * 100) : 100
    });
    } catch (error) {
    console.error('Me xatosi:', error);
    res.status(400).json({ error: error.message || "Server xatosi" });
  }
});

app.get('/api/day/:date', async (req, res) => {
  try {
    if (!isValidDateString(req.params.date)) {
      return res.status(400).json({ error: "Sana noto'g'ri formatda." });
    }

    const rows = await prisma.booking.findMany({
      where: { date: dayToUtc(req.params.date) },
      include: { user: true },
      orderBy: { startTime: 'asc' }
    });

    res.json(rows.map((row) => ({
      ...publicBooking(row),
      user: { ...row.user, telegramId: row.user.telegramId.toString() }
    })));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/bookings/:id/cancel', async (req, res) => {
  try {
    if (!req.body.reason?.trim()) throw new Error("Bekor qilish sababini yozing.");

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancellationReason: req.body.reason.trim() }
    });

    await sendTelegram(
      process.env.ADMIN_TELEGRAM_ID,
      "❗ Navbat bekor qilindi\nSana: " + dateKey(booking.date) + " " + booking.startTime + "\nSabab: " + booking.cancellationReason
    );

    await broadcast(
      "✂️ Bo'sh vaqt ochildi! " + dateKey(booking.date) + " kuni soat " + booking.startTime + " dagi navbat bekor qilindi. Hozir band qilishingiz mumkin."
    );

    res.json(publicBooking(booking));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== ADMIN API =====

app.get('/api/admin/overview', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });

    const today = dayToUtc(tzDate());
    const month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));

    const [todayBookings, monthBookings, totalUsers, totalBookings] = await Promise.all([
      prisma.booking.findMany({ where: { date: today, status: 'COMPLETED' } }),
      prisma.booking.findMany({ where: { date: { gte: month }, status: 'COMPLETED' } }),
      prisma.user.count(),
      prisma.booking.count()
    ]);

    const income = (list) => list.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      todayClients: todayBookings.length,
      todayIncome: income(todayBookings),
      monthClients: monthBookings.length,
      monthIncome: income(monthBookings),
      totalUsers,
      totalBookings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });

    const { status, date, limit = '50' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date && isValidDateString(date)) where.date = dayToUtc(date);

    const bookings = await prisma.booking.findMany({
      where,
      include: { user: true },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      take: parseInt(limit) || 50
    });

    res.json(bookings.map((b) => ({
      ...publicBooking(b),
      user: { ...b.user, telegramId: b.user.telegramId.toString() }
    })));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });

    const users = await prisma.user.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users.map((u) => ({
      ...u,
      telegramId: u.telegramId.toString(),
      totalBookings: u._count.bookings
    })));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/reset-day/:date', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
    if (!isValidDateString(req.params.date)) {
      return res.status(400).json({ error: "Sana noto'g'ri formatda." });
    }

    const dateValue = dayToUtc(req.params.date);
    const result = await prisma.booking.updateMany({
      where: { date: dateValue, status: 'BOOKED' },
      data: { status: 'CANCELLED', cancellationReason: 'Admin tomonidan reset qilindi' }
    });

    res.json({ message: result.count + " ta navbat bekor qilindi.", count: result.count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/day-off', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
    const dayOffs = await prisma.dayOff.findMany({ orderBy: { date: 'desc' } });
    res.json(dayOffs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/day-off', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
    const { date, reason } = req.body;
    if (!date || !isValidDateString(date)) throw new Error("Sana noto'g'ri.");
    if (!reason?.trim()) throw new Error('Sababni kiriting.');

    const dayOff = await prisma.dayOff.upsert({
      where: { date: dayToUtc(date) },
      update: { reason: reason.trim() },
      create: { date: dayToUtc(date), reason: reason.trim() }
    });

    res.json(dayOff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/day-off/:date', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
    if (!isValidDateString(req.params.date)) {
      return res.status(400).json({ error: "Sana noto'g'ri formatda." });
    }

    await prisma.dayOff.delete({ where: { date: dayToUtc(req.params.date) } });
    res.json({ message: "Dam olish kuni o'chirildi." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });

    const today = dayToUtc(tzDate());
    const month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const year = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));

    const [
      totalUsers,
      totalBookings,
      todayBookings,
      monthBookings,
      yearBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.findMany({ where: { date: today } }),
      prisma.booking.findMany({ where: { date: { gte: month } } }),
      prisma.booking.findMany({ where: { date: { gte: year } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'NO_SHOW' } })
    ]);

    const sumIncome = (list) => list.reduce((s, b) => s + b.totalPrice, 0);

    res.json({
      totalUsers,
      totalBookings,
      today: {
        bookings: todayBookings.length,
        completed: todayBookings.filter((b) => b.status === 'COMPLETED').length,
        income: sumIncome(todayBookings.filter((b) => b.status === 'COMPLETED'))
      },
      month: {
        bookings: monthBookings.length,
        completed: monthBookings.filter((b) => b.status === 'COMPLETED').length,
        income: sumIncome(monthBookings.filter((b) => b.status === 'COMPLETED'))
      },
      year: {
        bookings: yearBookings.length,
        completed: yearBookings.filter((b) => b.status === 'COMPLETED').length,
        income: sumIncome(yearBookings.filter((b) => b.status === 'COMPLETED'))
      },
      byStatus: {
        completed: completedBookings,
        cancelled: cancelledBookings,
        noShow: noShowBookings,
        booked: totalBookings - completedBookings - cancelledBookings - noShowBookings
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/admin/bookings/:id/status', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });

    const status = req.body.status;
    if (!['BOOKED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: "Noto'g'ri holat." });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/broadcast', async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Admin ruxsati kerak.' });
    if (!req.body.text?.trim()) return res.status(400).json({ error: 'Xabar matnini kiriting.' });

    res.json({ deliveredTo: await broadcast(req.body.text.trim()) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('jcute_snip API: http://localhost:' + PORT));