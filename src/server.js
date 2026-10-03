// src\server.js
import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { SERVICES, LEGACY, HAIRCUT_IDS, totalFor, AppError } from './catalog.js';
import { availableSlots, lunchWindow, dayToUtc, toTime, fromTime } from './schedule.js';
import { broadcast, sendTelegram } from './telegram.js';
import { startBot } from './bot.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TZ = 'Asia/Tashkent';
const ADMIN_ID = String(process.env.ADMIN_TELEGRAM_ID || '719139730');
const CARD = '9860 0201 2138 9496';
const CARD_OWNER = 'Jamshid Boishov';
const LOCATION_URL = 'https://www.google.com/maps/search/?api=1&query=Aura+Beauty+Studio+Almalyk';
const DEFAULT_BIRTH = new Date('2000-01-01T00:00:00.000Z');

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// ===== Yordamchilar =====
const dateKey = (d) => d.toISOString().slice(0, 10);
const tzDate = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const tzMinutes = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => Number(parts.find((p) => p.type === t).value);
  return g('hour') * 60 + g('minute');
};

const isValidDateString = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00.000Z').getTime());
const isValidTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

function normalizePhone(value) {
  let d = String(value || '').replace(/\D/g, '');
  if (d.length === 9) d = '998' + d;
  return /^998\d{9}$/.test(d) ? '+' + d : null;
}

function cleanName(value) {
  const v = String(value || '').trim().replace(/\s+/g, ' ');
  return /^[\p{L}\p{M}'’`.\- ]{2,40}$/u.test(v) ? v : null;
}

const publicBooking = (b) => ({
  id: b.id,
  date: dateKey(b.date),
  startTime: b.startTime,
  endTime: b.endTime,
  services: JSON.parse(b.services),
  totalPrice: b.totalPrice,
  totalMinutes: b.totalMinutes,
  paymentMethod: b.paymentMethod,
  contactPhone: b.contactPhone,
  status: b.status,
  cancellationReason: b.cancellationReason
});

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (e instanceof AppError) return res.status(400).json({ error: e.message });
    console.error('Server xatosi:', req.method, req.path, e);
    res.status(500).json({ error: 'Server xatosi. Birozdan keyin urinib ko\'ring.' });
  });

// Bir vaqtda ikki kishi bir slotni olib qo'ymasligi uchun navbat (mutex)
let lockChain = Promise.resolve();
const withLock = (fn) => {
  const run = lockChain.then(fn, fn);
  lockChain = run.catch(() => {});
  return run;
};

// ===== Telegram initData tekshiruvi =====
function verifyInitData(initData) {
  try {
    const token = process.env.BOT_TOKEN;
    if (!token || !initData) return null;
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');
    const check = [...params.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const calc = crypto.createHmac('sha256', secret).update(check).digest('hex');
    const a = Buffer.from(calc, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const authDate = Number(params.get('auth_date') || 0);
    if (!authDate || Date.now() / 1000 - authDate > 7 * 24 * 3600) return null;
    const user = JSON.parse(params.get('user') || 'null');
    return user?.id ? String(user.id) : null;
  } catch {
    return null;
  }
}

function resolveTgId(req) {
  const id = verifyInitData(req.header('x-telegram-init-data'));
  if (id) return id;
  // Faqat test uchun: Render env'ga INSECURE_HEADER_AUTH=true qo'ysangiz ishlaydi
  if (process.env.INSECURE_HEADER_AUTH === 'true') {
    const h = req.header('x-telegram-id');
    if (h && /^\d{1,15}$/.test(h)) return h;
  }
  return null;
}

app.use('/api', (req, _res, next) => {
  req.tgId = resolveTgId(req);
  next();
});

const auth = (req, res, next) =>
  req.tgId ? next() : res.status(401).json({ error: 'Iltimos, ilovani Telegram orqali oching.' });
const adminOnly = (req, res, next) =>
  req.tgId && req.tgId === ADMIN_ID ? next() : res.status(403).json({ error: 'Admin ruxsati kerak.' });

// ===== Habarnomalar =====
async function notify({ user = null, type, title, body, titleRu = null, bodyRu = null, telegram = true }) {
  await prisma.notification.create({
    data: { userId: user ? user.id : null, type, title, body, titleRu, bodyRu }
  });
  if (user && telegram) {
    sendTelegram(user.telegramId, `${title}\n${body}`).catch(() => {});
  }
}

const notifWhere = (user) => ({
  OR: [{ userId: null, createdAt: { gte: user.createdAt } }, { userId: user.id }]
});

// ===== Ishonchlilik =====
function computeReliability(bookings) {
  const events = bookings
    .filter((b) => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status))
    .sort((a, b) => a.updatedAt - b.updatedAt);
  let value = 100;
  for (const b of events) {
    value = b.status === 'COMPLETED' ? Math.min(100, value + 20) : Math.max(0, value - 20);
  }
  return value;
}

async function reliabilityAlert(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { bookings: true } });
  if (!user) return;
  const value = computeReliability(user.bookings);
  if (value < 50) {
    await notify({
      user,
      type: 'ALERT',
      title: '⚠️ Ishonchlilik darajasi',
      body: "Sizning ishonchlilik darajangiz 50 foizdan kamayib ketti, iltimos mas'uliyatli bo'ling.",
      titleRu: '⚠️ Уровень надёжности',
      bodyRu: 'Ваш уровень надёжности опустился ниже 50%, пожалуйста, будьте ответственнее.'
    });
  }
}

// ===== Kun hisoblash =====
async function computeDay(date, minutes) {
  const [dayOff, bookings] = await Promise.all([
    prisma.dayOff.findUnique({ where: { date: dayToUtc(date) } }),
    prisma.booking.findMany({ where: { date: dayToUtc(date), status: 'BOOKED' } })
  ]);
  const minStart = date === tzDate() ? tzMinutes() + 1 : 0;
  return {
    dayOff,
    bookings,
    slots: availableSlots(bookings, minutes, { dayOff, minStart }),
    lunch: lunchWindow(bookings),
    minStart
  };
}

// ===== PUBLIC API =====
app.get('/api/config', (req, res) => {
  res.json({
    services: SERVICES,
    legacy: LEGACY,
    card: CARD,
    cardOwner: CARD_OWNER,
    locationUrl: LOCATION_URL,
    address: 'Almalyk, Aura Beauty Studio',
    today: tzDate(),
    isAdmin: Boolean(req.tgId && req.tgId === ADMIN_ID)
  });
});

app.get('/api/me', auth, wrap(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(req.tgId) },
    include: { bookings: true }
  });
  if (!user) return res.status(404).json({ error: 'Profil topilmadi.' });

  const completed = user.bookings.filter((b) => b.status === 'COMPLETED');
  const haircutVisits = completed.filter((b) => {
    try { return JSON.parse(b.services).some((id) => HAIRCUT_IDS.includes(id)); } catch { return false; }
  }).length;

  const sortAsc = (a, b) => (dateKey(a.date) + a.startTime).localeCompare(dateKey(b.date) + b.startTime);
  const active = user.bookings.filter((b) => b.status === 'BOOKED').sort(sortAsc).map(publicBooking);
  const last = [...user.bookings].sort((a, b) => b.createdAt - a.createdAt)[0];

  const seenAt = user.notifSeenAt ?? user.createdAt;
  const unread = await prisma.notification.count({
    where: { AND: [notifWhere(user), { createdAt: { gt: seenAt } }] }
  });

  res.json({
    user: { firstName: user.firstName, lastName: user.lastName, phone: user.phone },
    stats: {
      visits: completed.length,
      spent: completed.reduce((s, b) => s + b.totalPrice, 0),
      haircutVisits,
      reliability: computeReliability(user.bookings),
      loyalty: user.loyaltyCount,
      loyaltyTarget: 10
    },
    active,
    lastBooking: last ? publicBooking(last) : null,
    unread
  });
}));

app.post('/api/register', auth, wrap(async (req, res) => {
  const firstName = cleanName(req.body.firstName);
  const lastName = cleanName(req.body.lastName);
  if (!firstName) throw new AppError("Ismni to'g'ri kiriting.");
  if (!lastName) throw new AppError("Familiyani to'g'ri kiriting.");
  const phone = normalizePhone(req.body.phone);
  if (!phone) throw new AppError("Telefon raqamini to'liq kiriting: +998 XX XXX XX XX");

  const tgId = BigInt(req.tgId);
  await prisma.user.upsert({
    where: { telegramId: tgId },
    update: { firstName, lastName, phone },
    create: { telegramId: tgId, firstName, lastName, phone, birthDate: DEFAULT_BIRTH }
  });
  res.json({ ok: true });
}));

app.get('/api/slots', auth, wrap(async (req, res) => {
  const { date, services } = req.query;
  if (!isValidDateString(date)) throw new AppError("Sana noto'g'ri formatda.");
  if (date < tzDate()) throw new AppError("O'tgan sanaga navbat olib bo'lmaydi.");

  const ids = String(services || '').split(',').map((s) => s.trim()).filter(Boolean);
  const totals = totalFor(ids);
  const day = await computeDay(date, totals.minutes);

  res.json({
    slots: day.slots,
    lunch: day.lunch,
    dayOff: day.dayOff
      ? { startTime: day.dayOff.startTime, endTime: day.dayOff.endTime, reason: day.dayOff.reason }
      : null,
    price: totals.price,
    minutes: totals.minutes
  });
}));

app.post('/api/bookings', auth, wrap(async (req, res) => {
  const { date, startTime, services, paymentMethod } = req.body;
  if (!isValidDateString(date)) throw new AppError("Sana noto'g'ri.");
  if (date < tzDate()) throw new AppError("O'tgan sanaga navbat olib bo'lmaydi.");
  if (!isValidTime(startTime)) throw new AppError("Vaqt noto'g'ri.");
  if (!['CASH', 'CARD'].includes(paymentMethod)) throw new AppError("To'lov turini tanlang.");
  const contactPhone = normalizePhone(req.body.contactPhone);
  if (!contactPhone) throw new AppError("Aloqa raqamini to'liq kiriting: +998 XX XXX XX XX");

  const totals = totalFor(services);
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(req.tgId) } });
  if (!user) throw new AppError("Avval ro'yxatdan o'ting.");

  const booking = await withLock(async () => {
    const day = await computeDay(date, totals.minutes);
    if (day.dayOff && !day.dayOff.startTime) throw new AppError('Bu kun dam olish kuni.');
    const slot = day.slots.find((s) => s.time === startTime);
    if (!slot || !slot.free) throw new AppError('Bu vaqt band. Boshqasini tanlang.');

    const start = fromTime(startTime);
    return prisma.booking.create({
      data: {
        userId: user.id,
        date: dayToUtc(date),
        startTime,
        endTime: toTime(start + totals.minutes),
        services: JSON.stringify(totals.ids),
        totalPrice: totals.price,
        totalMinutes: totals.minutes,
        paymentMethod,
        contactPhone
      }
    });
  });

  sendTelegram(
    ADMIN_ID,
    `🆕 Yangi navbat\n${user.firstName} ${user.lastName}\n${date} ${booking.startTime}–${booking.endTime}\n${totals.price} so'm`
  ).catch(() => {});

  res.status(201).json({ booking: publicBooking(booking) });
}));

app.post('/api/bookings/:id/cancel', auth, wrap(async (req, res) => {
  const reason = String(req.body.reason || '').trim();
  if (reason.length < 3) throw new AppError('Bekor qilish sababini yozing.');

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!booking) throw new AppError('Navbat topilmadi.');
  const isOwner = String(booking.user.telegramId) === req.tgId;
  if (!isOwner && req.tgId !== ADMIN_ID) return res.status(403).json({ error: 'Ruxsat yo\'q.' });

  const upd = await prisma.booking.updateMany({
    where: { id: booking.id, status: 'BOOKED' },
    data: { status: 'CANCELLED', cancellationReason: reason.slice(0, 500) }
  });
  if (!upd.count) throw new AppError('Bu navbat allaqachon yopilgan.');

  sendTelegram(
    ADMIN_ID,
    `❗ Navbat bekor qilindi\n${booking.user.firstName} ${booking.user.lastName}\n${dateKey(booking.date)} ${booking.startTime}\nSabab: ${reason}`
  ).catch(() => {});

  if (isOwner) await reliabilityAlert(booking.userId);
  res.json({ ok: true });
}));

// Hammaga ochiq: faqat band vaqtlar, shaxsiy ma'lumotsiz
app.get('/api/public/busy', auth, wrap(async (_req, res) => {
  const today = tzDate();
  const from = dayToUtc(today);
  const to = new Date(from.getTime() + 120 * 86400000);
  const [bookings, dayOffs] = await Promise.all([
    prisma.booking.findMany({
      where: { status: 'BOOKED', date: { gte: from, lte: to } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    }),
    prisma.dayOff.findMany({ where: { date: { gte: from } }, orderBy: { date: 'asc' } })
  ]);

  const nowMin = tzMinutes();
  const map = new Map();
  const get = (k) => {
    if (!map.has(k)) map.set(k, { date: k, all: [], bookings: [], dayOff: null });
    return map.get(k);
  };

  for (const b of bookings) {
    const k = dateKey(b.date);
    const d = get(k);
    d.all.push(b);
    if (k === today && fromTime(b.endTime) <= nowMin) continue;
    d.bookings.push({ startTime: b.startTime, endTime: b.endTime });
  }
  for (const o of dayOffs) {
    get(dateKey(o.date)).dayOff = { startTime: o.startTime, endTime: o.endTime };
  }

  const days = [...map.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      dayOff: d.dayOff,
      bookings: d.bookings,
      lunch: d.all.length ? lunchWindow(d.all) : null
    }))
    .filter((d) => d.bookings.length || d.dayOff);

  res.json({
    days,
    dayOffs: dayOffs.map((o) => ({ date: dateKey(o.date), startTime: o.startTime, endTime: o.endTime }))
  });
}));

// ===== Habarnomalar =====
app.get('/api/notifications', auth, wrap(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(req.tgId) } });
  if (!user) return res.status(404).json({ error: 'Profil topilmadi.' });
  const seenAt = user.notifSeenAt ?? user.createdAt;
  const items = await prisma.notification.findMany({
    where: notifWhere(user),
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      titleRu: n.titleRu,
      bodyRu: n.bodyRu,
      createdAt: n.createdAt,
      isNew: n.createdAt > seenAt
    }))
  });
}));

app.post('/api/notifications/seen', auth, wrap(async (req, res) => {
  await prisma.user.updateMany({ where: { telegramId: BigInt(req.tgId) }, data: { notifSeenAt: new Date() } });
  res.json({ ok: true });
}));

// ===== AI yordamchi (Gemini) =====
const aiLast = new Map();
const AI_SYSTEM = `Sen "jcute_snip" barbershop (Almalyk, Aura Beauty Studio) ning AI yordamchisisan.
Vazifang: mijozlarning soch, soqol, teri parvarishi, soch to'kilishi, shampun va kosmetika vositalari, soch turmagi va barber xizmatlari bo'yicha savollariga professional, aniq va mas'uliyat bilan javob berish.
Qoidalar:
- Ishonchli, ilmiy asoslangan ma'lumotlarga tayan (dermatologiya, trixologiya tavsiyalari). Taxmin qilma, bilmasang ochiq ayt.
- Tibbiy tashxis qo'yma. Jiddiy simptomlar (kuchli to'kilish, yara, og'riq, yallig'lanish) bo'lsa, shifokor (dermatolog/trixolog) ga murojaat qilishni maslahat ber.
- Aniq brend reklamasi qilma; tarkib va faol moddalarga e'tibor ber (masalan ketokonazol, minoksidil kabi vositalar uchun shifokor bilan maslahatlashishni eslat).
- Rasm yuborilsa, soch/teri/soch turmagi holatini ehtiyotkorlik bilan tahlil qil.
- Mavzudan tashqari savollarga muloyim qilib, o'z yo'nalishingni eslat.
- Javoblar qisqa, tushunarli, amaliy bo'lsin. Narx va band vaqtlarni o'zing to'qima, ular uchun ilovadagi "Narxlar" va "Navbat olish" bo'limlariga yo'naltir.`;

app.post('/api/ai-assistant', auth, wrap(async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI hozircha sozlanmagan.' });

  const now = Date.now();
  if (now - (aiLast.get(req.tgId) || 0) < 3000) {
    return res.status(429).json({ error: 'Biroz kuting va qayta yuboring.' });
  }
  aiLast.set(req.tgId, now);

  const message = String(req.body.message || '').trim().slice(0, 2000);
  if (!message) throw new AppError('Xabar matnini yozing.');
  const lang = req.body.lang === 'ru' ? 'Rus tilida' : "O'zbek tilida (lotin yozuvida)";

  const contents = [];
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
  for (const h of history) {
    const text = String(h?.text || '').slice(0, 2000);
    if (!text) continue;
    contents.push({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text }] });
  }

  const parts = [{ text: message }];
  const img = req.body.imageBase64;
  if (typeof img === 'string' && img.startsWith('data:image/') && img.length < 6_000_000) {
    const comma = img.indexOf(',');
    const mime = img.slice(5, img.indexOf(';'));
    if (comma > 0 && /^image\/(png|jpe?g|webp)$/.test(mime)) {
      parts.push({ inlineData: { mimeType: mime, data: img.slice(comma + 1) } });
    }
  }
  contents.push({ role: 'user', parts });

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let r;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${AI_SYSTEM}\nJavobni ${lang} yoz.` }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 }
      }),
      signal: AbortSignal.timeout(40000)
    });
  } catch (e) {
    console.error('Gemini ulanish xatosi:', e.message);
    return res.status(502).json({ error: 'AI javob bermadi. Qayta urinib ko\'ring.' });
  }

  if (!r.ok) {
    console.error('Gemini xatosi:', r.status, (await r.text()).slice(0, 300));
    return res.status(502).json({ error: 'AI hozir band. Birozdan keyin urinib ko\'ring.' });
  }
  const data = await r.json();
  const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
  res.json({ reply: reply || "Kechirasiz, bu savolga javob bera olmadim. Savolni boshqacha yozib ko'ring." });
}));

// ===== ADMIN API =====
app.get('/api/admin/overview', auth, adminOnly, wrap(async (_req, res) => {
  const today = dayToUtc(tzDate());
  const month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const year = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  const done = { status: 'COMPLETED' };

  const [totalUsers, todayC, monthC, yearC, activeC] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count({ where: { ...done, date: today } }),
    prisma.booking.count({ where: { ...done, date: { gte: month } } }),
    prisma.booking.count({ where: { ...done, date: { gte: year } } }),
    prisma.booking.count({ where: { status: 'BOOKED' } })
  ]);
  res.json({ totalUsers, today: todayC, month: monthC, year: yearC, active: activeC });
}));

app.get('/api/admin/active', auth, adminOnly, wrap(async (_req, res) => {
  const today = tzDate();
  const rows = await prisma.booking.findMany({
    where: { status: 'BOOKED' },
    include: { user: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  const map = new Map();
  for (const b of rows) {
    const k = dateKey(b.date);
    if (!map.has(k)) map.set(k, { date: k, past: k < today, raw: [], bookings: [] });
    const d = map.get(k);
    d.raw.push(b);
    d.bookings.push({
      ...publicBooking(b),
      firstName: b.user.firstName,
      lastName: b.user.lastName,
      phone: b.user.phone
    });
  }
  const days = [...map.values()].map((d) => ({
    date: d.date,
    past: d.past,
    lunch: lunchWindow(d.raw),
    totalPrice: d.bookings.reduce((s, b) => s + b.totalPrice, 0),
    totalMinutes: d.bookings.reduce((s, b) => s + b.totalMinutes, 0),
    bookings: d.bookings
  }));
  res.json({ days });
}));

app.patch('/api/admin/bookings/:id/status', auth, adminOnly, wrap(async (req, res) => {
  const status = req.body.status;
  if (!['COMPLETED', 'NO_SHOW'].includes(status)) throw new AppError("Noto'g'ri holat.");

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { user: true } });
  if (!booking) throw new AppError('Navbat topilmadi.');

  const upd = await prisma.booking.updateMany({ where: { id: booking.id, status: 'BOOKED' }, data: { status } });
  if (!upd.count) throw new AppError('Bu navbat allaqachon baholangan.');

  if (status === 'COMPLETED') {
    if (booking.totalPrice >= 60000) {
      const next = booking.user.loyaltyCount + 1;
      if (next >= 10) {
        await prisma.user.update({ where: { id: booking.userId }, data: { loyaltyCount: 0 } });
        await notify({
          user: booking.user,
          type: 'LOYALTY',
          title: '🎁 Chegirma',
          body: 'Tabriklaymiz! Siz chegirmaga ega bo\'ldingiz.',
          titleRu: '🎁 Скидка',
          bodyRu: 'Поздравляем! Вы получили скидку.'
        });
      } else {
        await prisma.user.update({ where: { id: booking.userId }, data: { loyaltyCount: next } });
      }
    }
  } else {
    await reliabilityAlert(booking.userId);
  }
  res.json({ ok: true });
}));

app.get('/api/admin/day-off', auth, adminOnly, wrap(async (_req, res) => {
  const from = dayToUtc(tzDate());
  const rows = await prisma.dayOff.findMany({ where: { date: { gte: from } }, orderBy: { date: 'asc' } });
  res.json(rows.map((o) => ({ date: dateKey(o.date), startTime: o.startTime, endTime: o.endTime, reason: o.reason })));
}));

app.post('/api/admin/day-off', auth, adminOnly, wrap(async (req, res) => {
  const { date } = req.body;
  const reason = String(req.body.reason || '').trim().slice(0, 500);
  const startTime = req.body.startTime || null;
  const endTime = req.body.endTime || null;

  if (!isValidDateString(date)) throw new AppError("Sana noto'g'ri.");
  if (date < tzDate()) throw new AppError("O'tgan sanani belgilab bo'lmaydi.");
  if (!reason) throw new AppError('Izoh yozing.');
  if (startTime || endTime) {
    if (!isValidTime(startTime) || !isValidTime(endTime)) throw new AppError("Vaqt oralig'ini to'liq kiriting.");
    if (fromTime(startTime) >= fromTime(endTime)) throw new AppError("Boshlanish vaqti tugashdan oldin bo'lishi kerak.");
  }

  await prisma.dayOff.upsert({
    where: { date: dayToUtc(date) },
    update: { reason, startTime, endTime },
    create: { date: dayToUtc(date), reason, startTime, endTime }
  });

  const booked = await prisma.booking.findMany({ where: { date: dayToUtc(date), status: 'BOOKED' } });
  const conflicts = booked.filter((b) => {
    if (!startTime) return true;
    const s = fromTime(b.startTime);
    const e = s + b.totalMinutes;
    return !(e <= fromTime(startTime) || s >= fromTime(endTime));
  }).length;

  const range = startTime ? ` ${startTime}–${endTime}` : '';
  const rangeRu = startTime ? ` ${startTime}–${endTime}` : ' (весь день)';
  const note = {
    type: 'DAYOFF',
    title: '📅 Dam olish kuni',
    body: `${date}${startTime ? range : ' (butun kun)'} — ${reason}`,
    titleRu: '📅 Выходной день',
    bodyRu: `${date}${rangeRu} — ${reason}`
  };
  await prisma.notification.create({ data: note });
  broadcast(`${note.title}\n${note.body}\n\n${note.titleRu}\n${note.bodyRu}`).catch(() => {});

  res.json({ ok: true, conflicts });
}));

app.delete('/api/admin/day-off/:date', auth, adminOnly, wrap(async (req, res) => {
  if (!isValidDateString(req.params.date)) throw new AppError("Sana noto'g'ri.");
  await prisma.dayOff.deleteMany({ where: { date: dayToUtc(req.params.date) } });
  res.json({ ok: true });
}));

app.post('/api/admin/broadcast', auth, adminOnly, wrap(async (req, res) => {
  const text = String(req.body.text || '').trim().slice(0, 3000);
  if (!text) throw new AppError('Xabar matnini kiriting.');
  await prisma.notification.create({ data: { type: 'BROADCAST', title: '📢 Xabar', body: text, titleRu: '📢 Сообщение', bodyRu: text } });
  const count = await prisma.user.count();
  broadcast(text).catch(() => {});
  res.json({ deliveredTo: count });
}));

// ===== Fallback =====
app.use('/api', (_req, res) => res.status(404).json({ error: 'Topilmadi.' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Rasm juda katta. Kichikroq rasm yuboring.' });
  console.error('Kutilmagan xato:', err);
  res.status(err?.status || 500).json({ error: 'Server xatosi.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('jcute_snip API: port ' + PORT);
  if (process.env.RUN_BOT !== 'false') startBot();
});