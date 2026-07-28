const OPEN = 14 * 60;
const CLOSE = 22 * 60;
const DINNER = 18 * 60;
const DINNER_BREAK = 60;
const fromTime = (value) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
export const toTime = (value) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const dayToUtc = (day) => new Date(`${day}T00:00:00.000Z`);

export function reservedUntil(start, minutes) {
  const end = start + minutes;
  return start < DINNER && end > DINNER ? end + DINNER_BREAK : end;
}
export function availableSlots(bookings, minutes) {
  const occupied = bookings.filter((b) => b.status === 'BOOKED').map((b) => {
    const start = fromTime(b.startTime);
    return [start, reservedUntil(start, b.totalMinutes)];
  });
  const slots = [];
  for (let start = OPEN; start + minutes <= CLOSE; start += 30) {
    const end = start + minutes;
    // 18:00–19:00 is reserved dinner. A job begun before 18:00 may finish, then reserves its meal break.
    if (start >= DINNER && start < DINNER + DINNER_BREAK) continue;
    if (occupied.every(([a, b]) => end <= a || start >= b)) slots.push(toTime(start));
  }
  return slots;
}
export function validateSlot(bookings, startTime, minutes) {
  return availableSlots(bookings, minutes).includes(startTime);
}
