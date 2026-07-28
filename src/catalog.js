export const SERVICES = [
  { id: 'adult_haircut', name: 'Soch olish — kattalar', price: 50000, minutes: 60 },
  { id: 'kids_haircut', name: 'Soch olish — kichkinalar', price: 35000, minutes: 60 },
  { id: 'beard', name: 'Soqol olish', price: 25000, minutes: 30 },
  { id: 'lineup', name: 'Okantovka', price: 35000, minutes: 30 },
  { id: 'mask', name: 'Yuz uchun niqob', price: 35000, minutes: 40 },
  { id: 'coloring', name: "Soch bo'yash", price: 30000, minutes: 40 },
  { id: 'depilation', name: 'Depilatsiya', price: 35000, minutes: 30 }
];
export const byId = (id) => SERVICES.find((item) => item.id === id);
export function totalFor(serviceIds) {
  const selected = serviceIds.map(byId);
  if (selected.some((item) => !item)) throw new Error('Noma’lum servis tanlandi.');
  if (serviceIds.includes('lineup') && (serviceIds.includes('adult_haircut') || serviceIds.includes('kids_haircut'))) {
    throw new Error('Soch olish ichiga okantovka kiradi.');
  }
  return selected.reduce((sum, item) => ({ price: sum.price + item.price, minutes: sum.minutes + item.minutes }), { price: 0, minutes: 0 });
}
