export class AppError extends Error {}

export const SERVICES = [
  { id: 'adult_haircut_standard', group: 'adult', name: 'Soch olish — Standart', nameRu: 'Мужская стрижка — Стандарт', price: 60000, minutes: 60, haircut: true },
  { id: 'adult_haircut_creative', group: 'adult', name: 'Soch olish — Creative', nameRu: 'Мужская стрижка — Креатив', price: 70000, minutes: 60, haircut: true },
  { id: 'curl_adult', group: 'adult', name: 'Soch jingalak qilish — kattalar', nameRu: 'Завивка волос — взрослые', price: 350000, minutes: 180, curl: true },
  { id: 'kids_haircut_standard', group: 'kids', name: 'Soch olish — Standart (kichkina)', nameRu: 'Детская стрижка — Стандарт', price: 40000, minutes: 60, haircut: true },
  { id: 'kids_haircut_creative', group: 'kids', name: 'Soch olish — Creative (kichkina)', nameRu: 'Детская стрижка — Креатив', price: 50000, minutes: 60, haircut: true },
  { id: 'curl_kids', group: 'kids', name: 'Soch jingalak qilish — kichkinalar', nameRu: 'Завивка волос — дети', price: 250000, minutes: 180, curl: true },
  { id: 'zero_cut', group: 'other', name: '0 ga olish (kal)', nameRu: 'Стрижка наголо (под 0)', price: 35000, minutes: 30, haircut: true },
  { id: 'beard', group: 'other', name: 'Soqol olish', nameRu: 'Стрижка бороды', price: 30000, minutes: 30 },
  { id: 'lineup', group: 'other', name: 'Okantovka', nameRu: 'Окантовка', price: 35000, minutes: 30 },
  { id: 'mask', group: 'other', name: 'Yuz uchun niqob', nameRu: 'Маска для лица', price: 40000, minutes: 40 },
  { id: 'coloring', group: 'other', name: "Soch bo'yash", nameRu: 'Окрашивание волос', price: 35000, minutes: 40 },
  { id: 'depilation', group: 'other', name: 'Depilatsiya', nameRu: 'Депиляция', price: 40000, minutes: 30 }
];

// Eski bazadagi navbatlar uchun (faqat ko'rsatish uchun)
export const LEGACY = {
  adult_haircut: { id: 'adult_haircut', name: 'Soch olish — kattalar', nameRu: 'Мужская стрижка', haircut: true },
  kids_haircut: { id: 'kids_haircut', name: 'Soch olish — kichkinalar', nameRu: 'Детская стрижка', haircut: true }
};

export const HAIRCUT_IDS = [
  ...SERVICES.filter((s) => s.haircut).map((s) => s.id),
  'adult_haircut',
  'kids_haircut'
];

export const byId = (id) => SERVICES.find((item) => item.id === id);

export function totalFor(serviceIds) {
  if (!Array.isArray(serviceIds)) throw new AppError('Kamida bitta xizmat tanlang.');
  const ids = [...new Set(serviceIds.map(String))];
  if (!ids.length) throw new AppError('Kamida bitta xizmat tanlang.');

  const selected = ids.map(byId);
  if (selected.some((item) => !item)) throw new AppError("Noma'lum servis tanlandi.");

  if (ids.includes('lineup') && selected.some((s) => s.haircut)) {
    throw new AppError('Soch olish ichiga okantovka kiradi.');
  }

  return {
    ids,
    price: selected.reduce((sum, s) => sum + s.price, 0),
    minutes: selected.reduce((sum, s) => sum + s.minutes, 0)
  };
}