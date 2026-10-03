// src\schedule.js
export const OPEN = 14 * 60 + 30; // 14:30
export const CLOSE = 23 * 60; // 23:00
export const DINNER = 18 * 60; // tushlik standart boshlanishi
export const DINNER_BREAK = 60;
export const STEP = 30;

export const fromTime = (value) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export const toTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

export const dayToUtc = (day) => new Date(`${day}T00:00:00.000Z`);

// Navbat 18:00 ni kesib o'tsa, tushlik navbat tugaganidan keyin 1 soatga suriladi
export function reservedUntil(start, minutes) {
  const end = start + minutes;
  return start < DINNER && end > DINNER ? end + DINNER_BREAK : end;
}

export function lunchWindow(bookings) {
  for (const b of bookings) {
    if (b.status !== 'BOOKED') continue;
    const s = fromTime(b.startTime);
    const e = s + b.totalMinutes;
    if (s < DINNER && e > DINNER) {
      return { start: toTime(e), end: toTime(e + DINNER_BREAK), shifted: true };
    }
  }
  return { start: toTime(DINNER), end: toTime(DINNER + DINNER_BREAK), shifted: false };
}

/**
 * Barcha ehtimoliy boshlanish vaqtlarini qaytaradi:
 * [{ time, free, reason?, shift? }]
 * reason: busy | lunch | off | past
 */
export function availableSlots(bookings, minutes, { dayOff = null, minStart = 0 } = {}) {
  const occupied = bookings
    .filter((b) => b.status === 'BOOKED')
    .map((b) => {
      const start = fromTime(b.startTime);
      return [start, reservedUntil(start, b.totalMinutes)];
    });

  const fullDayOff = dayOff && !dayOff.startTime;
  const off = dayOff && dayOff.startTime ? [fromTime(dayOff.startTime), fromTime(dayOff.endTime)] : null;

  const result = [];
  for (let start = OPEN; start + minutes <= CLOSE; start += STEP) {
    const end = start + minutes;
    const reserved = reservedUntil(start, minutes);
    const time = toTime(start);

    if (fullDayOff) { result.push({ time, free: false, reason: 'off' }); continue; }
    if (start < minStart) { result.push({ time, free: false, reason: 'past' }); continue; }
    if (start >= DINNER && start < DINNER + DINNER_BREAK) {
      // Tushlik oynasi, lekin agar aynan shu vaqtda navbat bor bo'lsa busy bo'ladi
      const taken = occupied.some(([a, b]) => !(reserved <= a || start >= b));
      result.push({ time, free: false, reason: taken ? 'busy' : 'lunch' });
      continue;
    }
    if (!occupied.every(([a, b]) => reserved <= a || start >= b)) {
      result.push({ time, free: false, reason: 'busy' });
      continue;
    }
    if (off && !(end <= off[0] || start >= off[1])) {
      result.push({ time, free: false, reason: 'off' });
      continue;
    }

    const slot = { time, free: true };
    if (reserved !== end) slot.shift = toTime(end); // tushlik shu vaqtga suriladi
    result.push(slot);
  }
  return result;
}

export function validateSlot(bookings, startTime, minutes, opts) {
  return availableSlots(bookings, minutes, opts).some((s) => s.time === startTime && s.free);
}