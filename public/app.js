const tg = window.Telegram?.WebApp;
try { tg?.ready(); tg?.expand(); tg?.setHeaderColor?.('#000000'); tg?.setBackgroundColor?.('#000000'); } catch {}

const API = '/api';
const app = document.getElementById('app');
const $ = (s) => document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ===== I18N =====
const I18N = {
  uz: {
    tagline: "Yangi Era — O'zbekiston uchun !",
    welcome: 'Xush kelibsiz!',
    welcomeText: 'Barcha qulayliklar qadrli mijozlar uchun. Ishonchingiz uchun rahmat.',
    chooseLang: 'Tilni tanlang / Выберите язык',
    regTitle: "Ro'yxatdan o'tish", regDesc: "Navbat olish uchun ma'lumotlaringizni kiriting.",
    firstName: 'Ism', lastName: 'Familiya', phone: 'Telefon raqam', continue: 'Davom etish →',
    menuBook: 'Navbat olish', menuLists: 'Barcha navbatlar', menuCabinet: 'Shaxsiy kabinet', menuPrices: 'Narxlar',
    menuAi: 'AI Assistent', menuNotifs: 'Habarnomalar', menuReviews: 'Izohlar', menuLocation: 'Lokatsiya', menuAdmin: 'Admin panel',
    back: 'Orqaga', som: "so'm", hr: 'soat', min: 'daqiqa',
    pickDate: 'Sanani tanlang', pickServices: 'Xizmatlarni tanlang', pickTime: 'Vaqtni tanlang',
    total: 'Jami', payment: "To'lov turi", cash: 'Naqd', card: 'Karta orqali',
    cardNumber: 'Karta raqami', copy: 'Nusxa olish', copied: 'Nusxa olindi',
    contactPhone: "Bog'lanish uchun raqam", phoneBad: "Raqamni to'liq kiriting: +998 XX XXX XX XX",
    confirm: 'Navbatni tasdiqlash', gAdult: 'Kattalar', gKids: 'Kichkinalar', gOther: 'Boshqa xizmatlar',
    lineupIncluded: 'soch olishga kiradi',
    curlAlert: "Agar soch ham oldirish kerak bo'lsa, uni ham tanlang.",
    pickServiceFirst: 'Avval xizmat tanlang.', noSlots: "Bu xizmat uchun bo'sh vaqt yo'q.",
    busy: 'band', dayOffMsg: 'Bu kun dam olish kuni.', dayOffPart: 'Dam olish vaqti:',
    lunchLabel: 'Tushlik', lunchMoved: 'Tushlik vaqti suriladi:', lunchWillMove: 'Bu navbat tufayli tushlik suriladi:',
    selectDate: 'Sana tanlang', selectTime: 'Vaqtni tanlang', selectService: 'Kamida bitta xizmat tanlang.',
    bookingOk: 'Navbat muvaffaqiyatli band qilindi! ✅',
    listsTitle: 'Barcha navbatlar', listsDesc: "Band qilingan va hali tugallanmagan vaqtlar.", noBookings: "Hozircha band vaqt yo'q.",
    dayOffLabel: 'Dam olish', allDay: 'butun kun',
    pricesTitle: 'Narxlar',
    cabinetTitle: 'Shaxsiy kabinet', reliability: 'Ishonchlilik darajasi', reliabilityLow: "Ishonchlilik past! Iltimos, mas'uliyatli bo'ling.",
    statSpent: 'Jami sarflangan', statHair: 'Soch xizmatlari', statVisits: 'Tashriflar',
    loyaltyTitle: 'Chegirma indikatori', loyaltyDesc: "60 000 so'mdan kam bo'lmagan xizmat har safar +1. 10 ta bo'lganda chegirma beriladi.",
    activeBooking: 'Faol navbat', lastBooking: 'Oxirgi navbat', noBookingYet: 'Hali navbat olinmagan.',
    cancel: 'Bekor qilish', cancelTitle: 'Navbatni bekor qilish', cancelReason: 'Bekor qilish sababini yozing...',
    cancelConfirm: 'Bekor qilishni tasdiqlash', close: 'Yopish', cancelOk: 'Navbat bekor qilindi.',
    reasonLabel: 'Sabab', language: 'Til', status_BOOKED: 'Faol', status_COMPLETED: 'Yakunlangan', status_CANCELLED: 'Bekor', status_NO_SHOW: 'Kelmadi',
    notifTitle: 'Habarnomalar', noNotifs: 'Habarnomalar yo‘q.',
    aiTitle: 'jcute_snip yordamchi', aiDesc: 'Soch, soqol, teri parvarishi va boshqa savollaringizni yozing.',
    aiPlaceholder: 'Savolingizni yozing...', aiClear: 'Chat tarixini tozalash', aiCleared: 'Tarix tozalandi.',
    reviewsTitle: 'Izohlar', reviewsDesc: "Xizmatimizni baholang. Barcha mijozlar izohlarni ko'ra oladi, faqat ismingiz ko'rinadi.",
    reviewPh: 'Fikringizni yozing...', reviewSend: 'Yuborish', reviewPick: 'Yulduzchani tanlang.', reviewOk: 'Rahmat! Izohingiz saqlandi.',
    noReviews: 'Hozircha izohlar yo‘q.', allReviews: 'Barcha izohlar', outOf: '5 dan',
    adminTitle: 'Admin panel', aTotalUsers: "Ro'yxatdan o'tganlar", aToday: 'Bugun qabul', aMonth: 'Bu oy', aYear: 'Bu yil',
    aActive: 'Faol navbatlar', aNoActive: "Faol navbatlar yo'q.", aArrived: 'Keldi', aNoShow: 'Kelmadi', aPast: "o'tgan",
    aDayTotal: 'Kun jami', aClients: 'mijoz', aDayOff: 'Dam olish kunini belgilash', aDate: 'Sana', aFrom: 'Dan (ixtiyoriy)', aTo: 'Gacha (ixtiyoriy)',
    aComment: 'Izoh (hamma foydalanuvchiga yuboriladi)', aSetDayOff: 'Belgilash va xabar yuborish', aDayOffList: 'Belgilangan dam olish kunlari',
    aDelete: "O'chirish", aBroadcast: 'Hammaga xabar yuborish', aBroadcastPh: 'Xabar matni...', aSend: 'Yuborish',
    aSent: 'foydalanuvchiga yuborilmoqda.', aConflict: "ta faol navbat shu vaqtga to'g'ri keladi!",
    aDayOffOk: 'Dam olish kuni belgilandi.', aDeleted: "O'chirildi.", aStatusOk: 'Baholandi.', aAskArrived: 'Mijoz keldimi?', aAskNoShow: 'Mijoz kelmadimi?',
    aCancelled: 'Bekor qilingan navbatlar', aNoCancelled: "Bekor qilingan navbatlar yo'q.", aReason: 'Sabab',
    aUsers: "Ro'yxatdan o'tgan mijozlar", aNoUsers: "Mijozlar yo'q.",
    aResetTitle: 'Mijozlar statistikasini yangilash',
    aResetDesc: "Barcha mijozlarning tashriflari, sarfi, ishonchlilik foizi va chegirma indikatori nolga tushadi. Sizning umumiy hisobotingiz (bugun/oy/yil) o'zgarmaydi.",
    aResetAll: 'Hammasini reset qilish', aResetOne: 'Reset',
    aResetAskAll: "Barcha mijozlar statistikasi nolga tushiriladi. Davom etasizmi?", aResetAskOne: "Bu mijoz statistikasi nolga tushiriladi. Davom etasizmi?",
    aResetOk: 'Statistika yangilandi.',
    fill: "Barcha maydonlarni to'ldiring.", loading: 'Yuklanmoqda...', error: 'Xatolik', reload: 'Qayta yuklash',
    netError: 'Internet bilan aloqa yo‘q.', serverError: 'Server javobi noto‘g‘ri.', tgOnly: 'Iltimos, ilovani Telegram bot orqali oching.',
    address: 'Manzil'
  },
  ru: {
    tagline: 'Новая Эра — для Узбекистана !',
    welcome: 'Добро пожаловать!',
    welcomeText: 'Все удобства для наших дорогих клиентов. Спасибо за доверие.',
    chooseLang: 'Tilni tanlang / Выберите язык',
    regTitle: 'Регистрация', regDesc: 'Введите данные для записи.',
    firstName: 'Имя', lastName: 'Фамилия', phone: 'Номер телефона', continue: 'Продолжить →',
    menuBook: 'Записаться', menuLists: 'Все записи', menuCabinet: 'Личный кабинет', menuPrices: 'Цены',
    menuAi: 'AI Ассистент', menuNotifs: 'Уведомления', menuReviews: 'Отзывы', menuLocation: 'Локация', menuAdmin: 'Админ панель',
    back: 'Назад', som: 'сум', hr: 'ч', min: 'мин',
    pickDate: 'Выберите дату', pickServices: 'Выберите услуги', pickTime: 'Выберите время',
    total: 'Итого', payment: 'Способ оплаты', cash: 'Наличные', card: 'По карте',
    cardNumber: 'Номер карты', copy: 'Копировать', copied: 'Скопировано',
    contactPhone: 'Контактный номер', phoneBad: 'Введите номер полностью: +998 XX XXX XX XX',
    confirm: 'Подтвердить запись', gAdult: 'Взрослые', gKids: 'Дети', gOther: 'Другие услуги',
    lineupIncluded: 'входит в стрижку',
    curlAlert: 'Если нужна и стрижка, выберите её тоже.',
    pickServiceFirst: 'Сначала выберите услугу.', noSlots: 'Нет свободного времени для этой услуги.',
    busy: 'занято', dayOffMsg: 'Это выходной день.', dayOffPart: 'Время отдыха:',
    lunchLabel: 'Обед', lunchMoved: 'Обед перенесён:', lunchWillMove: 'Из-за этой записи обед будет перенесён:',
    selectDate: 'Выберите дату', selectTime: 'Выберите время', selectService: 'Выберите хотя бы одну услугу.',
    bookingOk: 'Запись успешно подтверждена! ✅',
    listsTitle: 'Все записи', listsDesc: 'Занятое и ещё не завершённое время.', noBookings: 'Пока нет занятого времени.',
    dayOffLabel: 'Выходной', allDay: 'весь день',
    pricesTitle: 'Цены',
    cabinetTitle: 'Личный кабинет', reliability: 'Уровень надёжности', reliabilityLow: 'Надёжность низкая! Будьте ответственнее.',
    statSpent: 'Всего потрачено', statHair: 'Стрижки', statVisits: 'Визиты',
    loyaltyTitle: 'Индикатор скидки', loyaltyDesc: 'Каждая услуга от 60 000 сум даёт +1. При 10 вы получаете скидку.',
    activeBooking: 'Активная запись', lastBooking: 'Последняя запись', noBookingYet: 'Записей ещё нет.',
    cancel: 'Отменить', cancelTitle: 'Отмена записи', cancelReason: 'Укажите причину отмены...',
    cancelConfirm: 'Подтвердить отмену', close: 'Закрыть', cancelOk: 'Запись отменена.',
    reasonLabel: 'Причина', language: 'Язык', status_BOOKED: 'Активна', status_COMPLETED: 'Завершена', status_CANCELLED: 'Отменена', status_NO_SHOW: 'Не пришёл',
    notifTitle: 'Уведомления', noNotifs: 'Уведомлений нет.',
    aiTitle: 'помощник jcute_snip', aiDesc: 'Задайте вопрос о волосах, бороде, уходе за кожей.',
    aiPlaceholder: 'Напишите вопрос...', aiClear: 'Очистить историю чата', aiCleared: 'История очищена.',
    reviewsTitle: 'Отзывы', reviewsDesc: 'Оцените наш сервис. Отзывы видны всем клиентам, показывается только ваше имя.',
    reviewPh: 'Напишите ваш отзыв...', reviewSend: 'Отправить', reviewPick: 'Выберите оценку.', reviewOk: 'Спасибо! Отзыв сохранён.',
    noReviews: 'Отзывов пока нет.', allReviews: 'Все отзывы', outOf: 'из 5',
    adminTitle: 'Админ панель', aTotalUsers: 'Зарегистрировано', aToday: 'Принято сегодня', aMonth: 'За месяц', aYear: 'За год',
    aActive: 'Активные записи', aNoActive: 'Нет активных записей.', aArrived: 'Пришёл', aNoShow: 'Не пришёл', aPast: 'прошедшая',
    aDayTotal: 'Итого за день', aClients: 'клиентов', aDayOff: 'Назначить выходной', aDate: 'Дата', aFrom: 'С (необязательно)', aTo: 'До (необязательно)',
    aComment: 'Комментарий (получат все пользователи)', aSetDayOff: 'Назначить и уведомить', aDayOffList: 'Назначенные выходные',
    aDelete: 'Удалить', aBroadcast: 'Сообщение всем', aBroadcastPh: 'Текст сообщения...', aSend: 'Отправить',
    aSent: 'пользователям отправляется.', aConflict: 'активных записей попадают на это время!',
    aDayOffOk: 'Выходной назначен.', aDeleted: 'Удалено.', aStatusOk: 'Отмечено.', aAskArrived: 'Клиент пришёл?', aAskNoShow: 'Клиент не пришёл?',
    aCancelled: 'Отменённые записи', aNoCancelled: 'Отменённых записей нет.', aReason: 'Причина',
    aUsers: 'Зарегистрированные клиенты', aNoUsers: 'Клиентов нет.',
    aResetTitle: 'Сброс статистики клиентов',
    aResetDesc: 'Визиты, траты, процент надёжности и индикатор скидки всех клиентов обнулятся. Ваш общий отчёт (сегодня/месяц/год) не изменится.',
    aResetAll: 'Сбросить всё', aResetOne: 'Сброс',
    aResetAskAll: 'Статистика всех клиентов будет обнулена. Продолжить?', aResetAskOne: 'Статистика этого клиента будет обнулена. Продолжить?',
    aResetOk: 'Статистика обновлена.',
    fill: 'Заполните все поля.', loading: 'Загрузка...', error: 'Ошибка', reload: 'Перезагрузить',
    netError: 'Нет связи с интернетом.', serverError: 'Неверный ответ сервера.', tgOnly: 'Пожалуйста, откройте приложение через Telegram-бота.',
    address: 'Адрес'
  }
};

let lang = localStorage.getItem('jcute_lang') || '';
const t = (k) => (I18N[lang || 'uz'][k] ?? I18N.uz[k] ?? k);

const MONTHS = {
  uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
};
const MONTHS_GEN = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
};
const WEEKDAYS = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
};
const WEEKDAYS_FULL = {
  uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
};

// ===== Yordamchilar =====
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + t('som');
const fmtMin = (m) => {
  const h = Math.floor(m / 60), r = m % 60;
  return [h ? `${h} ${t('hr')}` : '', r ? `${r} ${t('min')}` : ''].filter(Boolean).join(' ');
};
const fmtDate = (ds) => {
  const [y, m, d] = ds.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${d} ${MONTHS_GEN[lang || 'uz'][m - 1]}, ${WEEKDAYS_FULL[lang || 'uz'][wd]}`;
};
const fmtWhen = (iso) =>
  new Date(iso).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
    timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
const addMin = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const v = h * 60 + m + mins;
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};
const starsText = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function formatPhone(value) {
  let d = String(value || '').replace(/\D/g, '');
  if (d.length <= 3 && '998'.startsWith(d)) d = '';
  else if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  let out = '+998';
  if (d.length) out += ' ' + d.slice(0, 2);
  if (d.length > 2) out += ' ' + d.slice(2, 5);
  if (d.length > 5) out += ' ' + d.slice(5, 7);
  if (d.length > 7) out += ' ' + d.slice(7, 9);
  return out;
}
const phoneOk = (v) => /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(v);
function bindPhone(input) {
  input.addEventListener('input', () => { input.value = formatPhone(input.value); });
  input.addEventListener('focus', () => { if (!input.value) input.value = '+998 '; });
}

let toastTimer;
function toast(text, bad = false) {
  const el = $('#toast');
  el.textContent = text;
  el.className = bad ? 'bad' : '';
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.style.display = 'none'), 3500);
}

const DEMO_ID = localStorage.getItem('demoTelegramId');
async function api(url, options = {}) {
  const headers = {
    'content-type': 'application/json',
    'x-telegram-init-data': tg?.initData || '',
    'x-lang': lang || 'uz',
    ...(DEMO_ID ? { 'x-telegram-id': DEMO_ID } : {}),
    ...(options.headers || {})
  };
  let r;
  try {
    r = await fetch(API + url, { ...options, headers });
  } catch {
    throw new Error(t('netError'));
  }
  const raw = await r.text();
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error(t('serverError')); }
  if (!r.ok) {
    const e = new Error(data.error || t('error'));
    e.status = r.status;
    throw e;
  }
  return data;
}

const state = { config: null, me: null, bk: null };
const svc = (id) =>
  state.config.services.find((s) => s.id === id) || state.config.legacy?.[id] || null;
const svcName = (s) => (!s ? '' : lang === 'ru' ? s.nameRu || s.name : s.name);
const svcNameById = (id) => svcName(svc(id)) || id;

function show(html) {
  app.innerHTML = '<div class="page">' + html + '</div>';
  window.scrollTo(0, 0);
}
const backBtn = () => `<button class="back" data-nav="home">← ${t('back')}</button>`;
function go(view) {
  if (location.hash.slice(1) === view) route();
  else location.hash = view;
}

function openModal(html) {
  $('#modal').innerHTML = `<div class="overlay"><div class="sheet">${html}</div></div>`;
}
const closeModal = () => ($('#modal').innerHTML = '');

// ===== Marshrutlash =====
let routeToken = 0;
async function loadMe() {
  try {
    state.me = await api('/me');
  } catch (e) {
    if (e.status === 404) state.me = null;
    else throw e;
  }
  return state.me;
}

async function route() {
  const token = ++routeToken;
  try {
    if (!lang) { viewLang(); return; }
    document.documentElement.lang = lang;
    if (!state.config) {
      show(`<section class="card"><h2>${t('loading')}</h2></section>`);
      state.config = await api('/config');
    }
    await loadMe();
    if (token !== routeToken) return;
    if (!state.me) { viewRegister(); return; }

    const v = location.hash.slice(1) || 'home';
    if (v === 'book') await viewBook();
    else if (v === 'lists') await viewLists();
    else if (v === 'cabinet') viewCabinet();
    else if (v === 'prices') viewPrices();
    else if (v === 'notifs') await viewNotifs();
    else if (v === 'reviews') await viewReviews();
    else if (v === 'ai') await viewAi();
    else if (v === 'admin' && state.config.isAdmin) await viewAdmin();
    else viewHome();
  } catch (err) {
    console.error(err);
    const msg = err.status === 401 ? t('tgOnly') : err.message;
    show(`<section class="card"><h2>${t('error')}</h2><p class="muted">${esc(msg)}</p><button class="primary" style="margin-top:14px" onclick="location.reload()">${t('reload')}</button></section>`);
  }
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) go(nav.dataset.nav);
});
window.addEventListener('hashchange', route);

// ===== Til tanlash =====
function viewLang() {
  show(`<div class="lang-wrap">
    <h1 class="brand">jcute_snip</h1>
    <p class="muted">${I18N.uz.chooseLang}</p>
    <button class="lang-btn" data-lang="uz">🇺🇿 &nbsp;O'zbek tili</button>
    <button class="lang-btn" data-lang="ru">🇷🇺 &nbsp;Русский язык</button>
  </div>`);
  app.querySelectorAll('[data-lang]').forEach((b) => {
    b.onclick = async () => {
      lang = b.dataset.lang;
      localStorage.setItem('jcute_lang', lang);
      app.firstElementChild?.classList.add('leave');
      await sleep(420);
      route();
    };
  });
}

// ===== Ro'yxatdan o'tish =====
function viewRegister() {
  show(`<section class="card">
    <h2>${t('regTitle')}</h2><p class="muted">${t('regDesc')}</p>
    <label class="l">${t('firstName')}</label><input id="first" maxlength="40" autocomplete="given-name" placeholder="Jamshid">
    <label class="l">${t('lastName')}</label><input id="last" maxlength="40" autocomplete="family-name" placeholder="Boishov">
    <label class="l">${t('phone')}</label><input id="phone" type="tel" inputmode="tel" placeholder="+998 94 215 41 24">
    <p class="err" id="regErr"></p>
    <button class="cta" id="save">${t('continue')}</button>
  </section>`);
  bindPhone($('#phone'));
  $('#save').onclick = async () => {
    const firstName = $('#first').value.trim();
    const lastName = $('#last').value.trim();
    const phone = $('#phone').value.trim();
    const err = $('#regErr');
    err.textContent = '';
    if (!firstName || !lastName || !phone) { err.textContent = t('fill'); return; }
    if (!phoneOk(phone)) { err.textContent = t('phoneBad'); return; }
    const btn = $('#save');
    btn.disabled = true;
    try {
      await api('/register', { method: 'POST', body: JSON.stringify({ firstName, lastName, phone }) });
      app.firstElementChild?.classList.add('leave');
      await sleep(420);
      location.hash = 'home';
      route();
    } catch (e) {
      err.textContent = e.message;
      btn.disabled = false;
    }
  };
}

// ===== Asosiy menyu =====
function viewHome() {
  const unread = state.me?.unread || 0;
  const isAdmin = state.config.isAdmin;
  show(`
    <div class="hero"><h1 class="brand">jcute_snip</h1><p class="tagline">${t('tagline')}</p></div>
    <section class="card">
      <h2>${t('welcome')}</h2>
      <p class="muted">${t('welcomeText')}</p>
      <div class="menu">
        <button class="primary wide" data-nav="book"><span class="icon">＋</span>${t('menuBook')}</button>
        <button data-nav="lists"><span class="icon">☷</span>${t('menuLists')}</button>
        <button data-nav="cabinet"><span class="icon">◉</span>${t('menuCabinet')}</button>
        <button data-nav="prices"><span class="icon">₸</span>${t('menuPrices')}</button>
        <button data-nav="ai"><span class="icon">✨</span>${t('menuAi')}</button>
        <button data-nav="notifs"><span class="icon">🔔</span>${t('menuNotifs')}${unread ? `<span class="badge">${unread}</span>` : ''}</button>
        <button data-nav="reviews"><span class="icon">⭐</span>${t('menuReviews')}</button>
        <button id="loc"><span class="icon">⌖</span>${t('menuLocation')}</button>
        ${isAdmin ? `<button class="wide" data-nav="admin"><span class="icon">⚙</span>${t('menuAdmin')}</button>` : ''}
      </div>
      <p class="small" style="text-align:center;margin-top:14px">📍 ${esc(state.config.address)}</p>
    </section>`);
  $('#loc').onclick = () => {
    const url = state.config.locationUrl;
    if (tg?.openLink) tg.openLink(url); else window.open(url, '_blank');
  };
}

// ===== Navbat olish =====
async function viewBook() {
  const [y, m] = state.config.today.split('-').map(Number);
  state.bk = {
    date: state.config.today, services: [], slot: '', pay: 'CASH',
    calMonth: [y, m - 1], dayOffs: {}, slotData: null, token: 0,
    phone: formatPhone(state.me.user.phone || '')
  };
  show(`${backBtn()}
    <section class="card"><h3>📅 ${t('pickDate')}</h3><div id="cal"></div></section>
    <section class="card"><h3>✂️ ${t('pickServices')}</h3><div id="svc"></div><div id="curl"></div>
      <div class="total"><span>${t('total')}</span><b id="sum"></b></div></section>
    <section class="card"><h3>🕒 ${t('pickTime')}</h3><div id="slots"></div><div id="lunch"></div></section>
    <section class="card"><h3>💳 ${t('payment')}</h3>
      <div class="seg" id="pay"><button data-pay="CASH" class="active">${t('cash')}</button><button data-pay="CARD">${t('card')}</button></div>
      <div id="cardinfo"></div></section>
    <section class="card"><h3>📞 ${t('contactPhone')}</h3>
      <input id="contact" type="tel" inputmode="tel" value="${esc(state.bk.phone)}" placeholder="+998 90 123 45 67">
      <p class="err" id="phoneErr"></p>
      <button class="cta" id="confirm">${t('confirm')}</button></section>`);

  try {
    const busy = await api('/public/busy');
    busy.dayOffs.forEach((d) => (state.bk.dayOffs[d.date] = d));
  } catch {}
  if (!$('#cal')) return;

  drawCalendar(); drawServices(); drawSummary(); refreshSlots();

  bindPhone($('#contact'));

  $('#cal').onclick = (e) => {
    const bk = state.bk;
    const nav = e.target.closest('[data-cal]');
    if (nav) {
      let [yy, mm] = bk.calMonth;
      mm += Number(nav.dataset.cal);
      if (mm < 0) { mm = 11; yy--; } else if (mm > 11) { mm = 0; yy++; }
      bk.calMonth = [yy, mm];
      drawCalendar();
      return;
    }
    const day = e.target.closest('[data-date]');
    if (day && !day.disabled) {
      bk.date = day.dataset.date;
      bk.slot = '';
      drawCalendar();
      refreshSlots();
    }
  };

  $('#svc').onchange = () => {
    const bk = state.bk;
    let ids = [...document.querySelectorAll('#svc input:checked')].map((x) => x.value);
    if (ids.some((id) => svc(id)?.haircut)) ids = ids.filter((id) => id !== 'lineup');
    bk.services = ids;
    bk.slot = '';
    drawServices(); drawSummary(); refreshSlots();
  };

  $('#slots').onclick = (e) => {
    const b = e.target.closest('[data-slot]');
    if (!b || b.disabled) return;
    state.bk.slot = b.dataset.slot;
    drawSlots();
  };

  $('#pay').onclick = (e) => {
    const b = e.target.closest('[data-pay]');
    if (!b) return;
    state.bk.pay = b.dataset.pay;
    document.querySelectorAll('#pay button').forEach((x) => x.classList.toggle('active', x === b));
    drawCardInfo();
  };

  $('#confirm').onclick = confirmBooking;
}

function drawCalendar() {
  const bk = state.bk;
  const L = lang || 'uz';
  const [y, m] = bk.calMonth;
  const today = state.config.today;
  const [ty, tm] = today.split('-').map(Number);
  const first = new Date(Date.UTC(y, m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="day empty"></span>';
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const past = ds < today;
    const off = bk.dayOffs[ds];
    const full = off && !off.startTime;
    const cls = ['day'];
    if (past || full) cls.push('dis');
    if (full) cls.push('off'); else if (off) cls.push('part');
    if (ds === today) cls.push('today');
    if (ds === bk.date) cls.push('sel');
    cells += `<button class="${cls.join(' ')}" data-date="${ds}" ${past || full ? 'disabled' : ''}>${d}</button>`;
  }
  const idx = y * 12 + m, tIdx = ty * 12 + (tm - 1);
  $('#cal').innerHTML = `
    <div class="cal-head">
      <button class="cal-nav" data-cal="-1" ${idx <= tIdx ? 'disabled' : ''}>‹</button>
      <b>${MONTHS[L][m]} ${y}</b>
      <button class="cal-nav" data-cal="1" ${idx >= tIdx + 12 ? 'disabled' : ''}>›</button>
    </div>
    <div class="cal-week">${WEEKDAYS[L].map((w) => `<span>${w}</span>`).join('')}</div>
    <div class="cal-grid">${cells}</div>`;
}

function drawServices() {
  const bk = state.bk;
  const hasHair = bk.services.some((id) => svc(id)?.haircut);
  const groups = { adult: t('gAdult'), kids: t('gKids'), other: t('gOther') };
  let html = '';
  for (const g of ['adult', 'kids', 'other']) {
    const items = state.config.services.filter((s) => s.group === g);
    if (!items.length) continue;
    html += `<div class="grp">${groups[g]}</div>`;
    html += items.map((s) => {
      const dis = s.id === 'lineup' && hasHair;
      const on = bk.services.includes(s.id);
      return `<label class="svc ${on ? 'on' : ''} ${dis ? 'dis' : ''}">
        <input type="checkbox" value="${s.id}" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''}>
        <span class="chk"></span>
        <span class="nm">${esc(svcName(s))}${dis ? `<small>${t('lineupIncluded')}</small>` : ''}</span>
        <span class="pr">${money(s.price)}<small>${fmtMin(s.minutes)}</small></span>
      </label>`;
    }).join('');
  }
  $('#svc').innerHTML = html;
}

function totals() {
  return state.bk.services.reduce((a, id) => {
    const s = svc(id);
    return s ? { price: a.price + s.price, minutes: a.minutes + s.minutes } : a;
  }, { price: 0, minutes: 0 });
}

function drawSummary() {
  const tt = totals();
  $('#sum').innerHTML = `${money(tt.price)}<small>${tt.minutes ? fmtMin(tt.minutes) : '—'}</small>`;
  const hasCurl = state.bk.services.some((id) => svc(id)?.curl);
  $('#curl').innerHTML = hasCurl ? `<div class="alert warn">⚠️ ${t('curlAlert')}</div>` : '';
}

async function refreshSlots() {
  const bk = state.bk;
  const tok = ++bk.token;
  if (!bk.services.length) {
    bk.slotData = null;
    $('#slots').innerHTML = `<p class="muted">${t('pickServiceFirst')}</p>`;
    $('#lunch').innerHTML = '';
    return;
  }
  $('#slots').innerHTML = `<p class="muted">${t('loading')}</p>`;
  try {
    const data = await api(`/slots?date=${bk.date}&services=${bk.services.join(',')}`);
    if (tok !== bk.token || !$('#slots')) return;
    bk.slotData = data;
    drawSlots();
  } catch (e) {
    if (tok === bk.token && $('#slots')) $('#slots').innerHTML = `<p class="err">${esc(e.message)}</p>`;
  }
}

function drawSlots() {
  const bk = state.bk;
  const data = bk.slotData;
  if (!data) return;
  const box = $('#slots');
  let note = '';

  if (data.dayOff && !data.dayOff.startTime) {
    box.innerHTML = `<div class="alert bad">⛔ ${t('dayOffMsg')}${data.dayOff.reason ? '<br>' + esc(data.dayOff.reason) : ''}</div>`;
    $('#lunch').innerHTML = '';
    return;
  }
  if (data.dayOff) {
    note += `<div class="alert warn">⛔ ${t('dayOffPart')} ${data.dayOff.startTime}–${data.dayOff.endTime}${data.dayOff.reason ? ' · ' + esc(data.dayOff.reason) : ''}</div>`;
  }
  if (!data.slots.length) {
    box.innerHTML = `<p class="muted">${t('noSlots')}</p>`;
    $('#lunch').innerHTML = note;
    return;
  }

  box.innerHTML = `<div class="slots">${data.slots.map((s) => {
    if (s.free) {
      return `<button class="slot ${bk.slot === s.time ? 'sel' : ''}" data-slot="${s.time}">${s.time}<small></small></button>`;
    }
    const tag = s.reason === 'busy' ? t('busy') : s.reason === 'lunch' ? '🍽' : s.reason === 'off' ? '⛔' : '';
    return `<button class="slot dis ${s.reason}" disabled>${s.time}<small>${tag}</small></button>`;
  }).join('')}</div>`;

  const chosen = data.slots.find((s) => s.time === bk.slot);
  if (chosen?.shift) {
    note += `<div class="alert warn">🍽 ${t('lunchWillMove')} ${chosen.shift}–${addMin(chosen.shift, 60)}</div>`;
  } else if (data.lunch.shifted) {
    note += `<div class="alert warn">🍽 ${t('lunchMoved')} ${data.lunch.start}–${data.lunch.end}</div>`;
  } else {
    note += `<div class="alert info">🍽 ${t('lunchLabel')}: ${data.lunch.start}–${data.lunch.end}</div>`;
  }
  $('#lunch').innerHTML = note;
}

function drawCardInfo() {
  const box = $('#cardinfo');
  if (state.bk.pay !== 'CARD') { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="cardbox">
    <div class="small">${t('cardNumber')}</div>
    <div class="num">${esc(state.config.card)}</div>
    <div class="small">${esc(state.config.cardOwner)}</div>
    <button id="copy">📋 ${t('copy')}</button></div>`;
  $('#copy').onclick = async () => {
    const num = state.config.card.replace(/\s/g, '');
    try { await navigator.clipboard.writeText(num); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = num; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    toast(t('copied'));
  };
}

async function confirmBooking() {
  const bk = state.bk;
  const phone = $('#contact').value.trim();
  $('#phoneErr').textContent = '';
  try {
    if (!bk.services.length) throw new Error(t('selectService'));
    if (!bk.slot) throw new Error(t('selectTime'));
    if (!phoneOk(phone)) { $('#phoneErr').textContent = t('phoneBad'); throw new Error(t('phoneBad')); }

    const btn = $('#confirm');
    btn.disabled = true;
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          date: bk.date, startTime: bk.slot, services: bk.services,
          paymentMethod: bk.pay, contactPhone: phone
        })
      });
    } catch (e) {
      btn.disabled = false;
      refreshSlots();
      throw e;
    }
    toast(t('bookingOk'));
    go('cabinet');
  } catch (e) {
    toast(e.message, true);
  }
}

// ===== Barcha navbatlar (shaxsiy ma'lumotsiz) =====
async function viewLists() {
  show(`${backBtn()}<section class="card"><h2>${t('listsTitle')}</h2><p class="muted">${t('listsDesc')}</p><p class="small">${t('loading')}</p></section>`);
  const data = await api('/public/busy');
  const body = data.days.length
    ? data.days.map((d) => `
        <div class="day-title">${fmtDate(d.date)}</div>
        ${d.dayOff ? `<div class="row-item off">⛔ ${t('dayOffLabel')}: ${d.dayOff.startTime ? d.dayOff.startTime + '–' + d.dayOff.endTime : t('allDay')}</div>` : ''}
        ${d.bookings.map((b) => `<div class="row-item"><b>${b.startTime}–${b.endTime}</b><span class="tag">${t('busy')}</span></div>`).join('')}
        ${d.lunch && d.bookings.length ? `<div class="row-item lunch">🍽 ${t('lunchLabel')}: ${d.lunch.start}–${d.lunch.end}</div>` : ''}`).join('')
    : `<p class="muted" style="margin-top:12px">${t('noBookings')}</p>`;
  show(`${backBtn()}<section class="card"><h2>${t('listsTitle')}</h2><p class="muted">${t('listsDesc')}</p>${body}</section>`);
}

// ===== Narxlar =====
function viewPrices() {
  const groups = { adult: t('gAdult'), kids: t('gKids'), other: t('gOther') };
  let html = '';
  for (const g of ['adult', 'kids', 'other']) {
    const items = state.config.services.filter((s) => s.group === g);
    if (!items.length) continue;
    html += `<div class="grp">${groups[g]}</div>` + items.map((s) =>
      `<div class="price-row"><span>${esc(svcName(s))}</span><span class="pr">${money(s.price)}<small>${fmtMin(s.minutes)}</small></span></div>`
    ).join('');
  }
  show(`${backBtn()}<section class="card"><h2>${t('pricesTitle')}</h2>${html}</section>`);
}

// ===== Shaxsiy kabinet =====
function bookingCard(b, withCancel) {
  return `<div class="booking">
    <div class="top"><b>${fmtDate(b.date)} · ${b.startTime}–${b.endTime}</b><span class="st ${b.status}">${t('status_' + b.status)}</span></div>
    <div class="svcs">${b.services.map(svcNameById).map(esc).join(', ')}</div>
    <div class="svcs">${money(b.totalPrice)} · ${fmtMin(b.totalMinutes)}</div>
    ${b.status === 'CANCELLED' && b.cancellationReason ? `<div class="svcs">${t('reasonLabel')}: ${esc(b.cancellationReason)}</div>` : ''}
    ${withCancel ? `<div class="btns"><button class="danger" data-cancel="${b.id}">${t('cancel')}</button></div>` : ''}
  </div>`;
}

function viewCabinet() {
  const me = state.me;
  const s = me.stats;
  const rel = s.reliability;
  const relCls = rel < 50 ? 'low' : rel < 80 ? 'mid' : '';
  const bookingsHtml = me.active.length
    ? `<h3>${t('activeBooking')}</h3>` + me.active.map((b) => bookingCard(b, true)).join('')
    : me.lastBooking
      ? `<h3>${t('lastBooking')}</h3>` + bookingCard(me.lastBooking, false)
      : `<p class="muted">${t('noBookingYet')}</p>`;

  show(`${backBtn()}
    <section class="card"><h2>${esc(me.user.firstName)} ${esc(me.user.lastName)}</h2><p class="muted">${esc(me.user.phone)}</p></section>
    <section class="card">${bookingsHtml}</section>
    <section class="card"><h3>${t('reliability')}</h3>
      <div class="meter ${relCls}"><i style="width:${rel}%"></i></div>
      <div class="meter-row"><span>${rel < 50 ? '⚠️ ' + t('reliabilityLow') : ''}</span><b>${rel}%</b></div></section>
    <section class="card"><div class="stat">
      <div class="full">${t('statSpent')}<b>${money(s.spent)}</b></div>
      <div>${t('statHair')}<b>${s.haircutVisits}</b></div>
      <div>${t('statVisits')}<b>${s.visits}</b></div></div></section>
    <section class="card"><h3>🎁 ${t('loyaltyTitle')}</h3>
      <div class="dots">${Array.from({ length: s.loyaltyTarget }, (_, i) => `<i class="${i < s.loyalty ? 'on' : ''}"></i>`).join('')}</div>
      <div class="meter-row"><span>${t('loyaltyDesc')}</span><b>${s.loyalty}/${s.loyaltyTarget}</b></div></section>
    <section class="card"><h3>${t('language')}</h3>
      <div class="lang-sw"><button data-setlang="uz" class="${lang === 'uz' ? 'active' : ''}">🇺🇿 O'zbekcha</button>
      <button data-setlang="ru" class="${lang === 'ru' ? 'active' : ''}">🇷🇺 Русский</button></div></section>`);

  app.querySelectorAll('[data-setlang]').forEach((b) => {
    b.onclick = () => {
      lang = b.dataset.setlang;
      localStorage.setItem('jcute_lang', lang);
      document.documentElement.lang = lang;
      loadMe().catch(() => {}); // tilni serverga ham yozib qo'yadi (Telegram xabarlari uchun)
      viewCabinet();
    };
  });

  app.querySelectorAll('[data-cancel]').forEach((b) => {
    b.onclick = () => openCancelModal(b.dataset.cancel);
  });
}

function openCancelModal(id) {
  openModal(`<h2>${t('cancelTitle')}</h2>
    <textarea id="reason" maxlength="500" placeholder="${t('cancelReason')}" style="margin-top:12px"></textarea>
    <div class="row" style="margin-top:14px">
      <button id="cclose">${t('close')}</button>
      <button class="danger" id="cgo" disabled>${t('cancelConfirm')}</button>
    </div>`);
  const ta = $('#reason'), go_ = $('#cgo');
  ta.focus();
  ta.oninput = () => (go_.disabled = ta.value.trim().length < 3);
  $('#cclose').onclick = closeModal;
  go_.onclick = async () => {
    go_.disabled = true;
    try {
      await api(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason: ta.value.trim() }) });
      closeModal();
      toast(t('cancelOk'));
      await loadMe();
      viewCabinet();
    } catch (e) {
      toast(e.message, true);
      go_.disabled = false;
    }
  };
}

// ===== Habarnomalar =====
async function viewNotifs() {
  show(`${backBtn()}<section class="card"><h2>🔔 ${t('notifTitle')}</h2><p class="small">${t('loading')}</p></section>`);
  const data = await api('/notifications');
  const icon = { ALERT: '⚠️', LOYALTY: '🎁', DAYOFF: '📅', BROADCAST: '📢', SLOT: '✂️' };
  const items = data.items.map((n) => {
    const title = lang === 'ru' && n.titleRu ? n.titleRu : n.title;
    const body = lang === 'ru' && n.bodyRu ? n.bodyRu : n.body;
    return `<div class="note ${n.isNew ? 'new' : ''}"><b>${icon[n.type] || '🔔'} ${esc(title)}</b><p>${esc(body)}</p><small>${fmtWhen(n.createdAt)}</small></div>`;
  }).join('');
  show(`${backBtn()}<section class="card"><h2>🔔 ${t('notifTitle')}</h2>${items || `<p class="muted" style="margin-top:10px">${t('noNotifs')}</p>`}</section>`);
  if (state.me?.unread) {
    api('/notifications/seen', { method: 'POST' }).then(() => { state.me.unread = 0; }).catch(() => {});
  }
}

// ===== Izohlar =====
async function viewReviews() {
  show(`${backBtn()}<section class="card"><h2>⭐ ${t('reviewsTitle')}</h2><p class="small">${t('loading')}</p></section>`);
  const data = await api('/reviews');
  let rating = data.mine?.rating || 0;

  const list = data.items.map((r) => `
    <div class="note"><b>${esc(r.name)} <span class="stars-s">${starsText(r.rating)}</span></b>
      ${r.text ? `<p>${esc(r.text)}</p>` : ''}<small>${fmtWhen(r.createdAt)}</small></div>`).join('');

  show(`${backBtn()}
    <section class="card"><h2>⭐ ${t('reviewsTitle')}</h2>
      <p class="muted">${t('reviewsDesc')}</p>
      ${data.count ? `<p class="avg">${data.avg} <small>${t('outOf')} · ${data.count}</small></p>` : ''}
      <div class="star-pick" id="starPick">${[1, 2, 3, 4, 5].map((n) => `<button data-star="${n}">★</button>`).join('')}</div>
      <textarea id="rtext" maxlength="500" placeholder="${t('reviewPh')}">${esc(data.mine?.text || '')}</textarea>
      <button class="cta" id="rsend">${t('reviewSend')}</button>
    </section>
    <section class="card"><h3>${t('allReviews')}</h3>${list || `<p class="muted">${t('noReviews')}</p>`}</section>`);

  const paint = () => document.querySelectorAll('#starPick button').forEach((b) =>
    b.classList.toggle('on', Number(b.dataset.star) <= rating));
  paint();
  $('#starPick').onclick = (e) => {
    const b = e.target.closest('[data-star]');
    if (!b) return;
    rating = Number(b.dataset.star);
    paint();
  };
  $('#rsend').onclick = async () => {
    if (!rating) { toast(t('reviewPick'), true); return; }
    $('#rsend').disabled = true;
    try {
      await api('/reviews', { method: 'POST', body: JSON.stringify({ rating, text: $('#rtext').value.trim() }) });
      toast(t('reviewOk'));
      viewReviews();
    } catch (e) {
      toast(e.message, true);
      $('#rsend').disabled = false;
    }
  };
}

// ===== AI Assistent (faqat chat, tarix serverda saqlanadi) =====
function aiFmt(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^\s*[*-]\s+/gm, '• ');
}

async function viewAi() {
  show(`${backBtn()}<section class="card">
    <h2>✨ ${t('aiTitle')}</h2><p class="muted">${t('aiDesc')}</p>
    <div class="chat" id="chat"></div>
    <div class="chat-in">
      <input id="msg" maxlength="2000" placeholder="${t('aiPlaceholder')}">
      <button class="primary" id="send">➤</button>
    </div>
    <button id="aiclear" style="width:100%;margin-top:12px;font-size:12px">🗑 ${t('aiClear')}</button>
  </section>`);

  const chat = $('#chat');
  const add = (html, cls) => {
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.innerHTML = html;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
  };

  try {
    const h = await api('/ai-history');
    h.items.forEach((m) => add(m.role === 'user' ? esc(m.text) : aiFmt(m.text), m.role === 'user' ? 'u' : 'a'));
  } catch {}

  const send = async () => {
    const input = $('#msg'), btn = $('#send');
    const text = input.value.trim();
    if (!text) return;
    add(esc(text), 'u');
    input.value = '';
    btn.disabled = true;
    const typing = add('...', 'a typing');
    try {
      const data = await api('/ai-assistant', { method: 'POST', body: JSON.stringify({ message: text, lang }) });
      typing.remove();
      add(aiFmt(data.reply), 'a');
    } catch (e) {
      typing.remove();
      add(esc(e.message), 'a');
    } finally {
      btn.disabled = false;
    }
  };
  $('#send').onclick = send;
  $('#msg').onkeydown = (e) => { if (e.key === 'Enter') send(); };

  $('#aiclear').onclick = async () => {
    try {
      await api('/ai-history', { method: 'DELETE' });
      chat.innerHTML = '';
      toast(t('aiCleared'));
    } catch (e) { toast(e.message, true); }
  };
}

// ===== Admin panel =====
async function viewAdmin() {
  const [ov, act, offs, canc, usr] = await Promise.all([
    api('/admin/overview'), api('/admin/active'), api('/admin/day-off'),
    api('/admin/cancelled'), api('/admin/users')
  ]);

  const activeHtml = act.days.length
    ? act.days.map((d) => `
        <div class="day-title">${fmtDate(d.date)} ${d.past ? `<span class="tag">${t('aPast')}</span>` : ''}</div>
        ${d.bookings.map((b) => `
          <div class="booking">
            <div class="top"><b>${b.startTime}–${b.endTime}</b><b style="color:var(--neon)">${money(b.totalPrice)}</b></div>
            <div class="svcs"><b style="color:var(--text)">${esc(b.firstName)} ${esc(b.lastName)}</b> · <a href="tel:${esc(b.contactPhone)}" style="color:var(--neon)">${esc(b.contactPhone)}</a></div>
            <div class="svcs">${b.services.map(svcNameById).map(esc).join(', ')} · ${fmtMin(b.totalMinutes)}</div>
            <div class="btns">
              <button class="ok" data-st="COMPLETED" data-id="${b.id}">✅ ${t('aArrived')}</button>
              <button class="danger" data-st="NO_SHOW" data-id="${b.id}">❌ ${t('aNoShow')}</button>
            </div>
          </div>`).join('')}
        <div class="row-item lunch">🍽 ${t('lunchLabel')}: ${d.lunch.start}–${d.lunch.end}</div>
        <div class="row-item"><span>${t('aDayTotal')}: ${d.bookings.length} ${t('aClients')} · ${fmtMin(d.totalMinutes)}</span><b style="color:var(--neon)">${money(d.totalPrice)}</b></div>`).join('')
    : `<p class="muted">${t('aNoActive')}</p>`;

  const offsHtml = offs.map((o) => `
    <div class="row-item off" style="align-items:flex-start">
      <span>${o.date}${o.startTime ? ' ' + o.startTime + '–' + o.endTime : ''}<br><small style="color:var(--dim)">${esc(o.reason)}</small></span>
      <button class="danger" style="padding:6px 12px;font-size:12px" data-deloff="${o.date}">${t('aDelete')}</button>
    </div>`).join('');

  const cancHtml = canc.items.length
    ? canc.items.map((c) => `
        <div class="booking">
          <div class="top"><b>${fmtDate(c.date)} · ${c.startTime}–${c.endTime}</b></div>
          <div class="svcs"><b style="color:var(--text)">${esc(c.firstName)} ${esc(c.lastName)}</b> · <a href="tel:${esc(c.phone)}" style="color:var(--neon)">${esc(c.phone)}</a></div>
          <div class="svcs" style="color:var(--warn)">${t('aReason')}: ${esc(c.reason || '—')}</div>
          <div class="svcs">${fmtWhen(c.at)}</div>
        </div>`).join('')
    : `<p class="muted">${t('aNoCancelled')}</p>`;

  const usersHtml = usr.users.length
    ? usr.users.map((u, i) => `
        <div class="row-item">
          <span><b>${i + 1}. ${esc(u.firstName)} ${esc(u.lastName)}</b><br><a href="tel:${esc(u.phone)}" style="color:var(--neon);font-size:13px">${esc(u.phone)}</a></span>
          <button class="danger" style="padding:6px 10px;font-size:12px" data-resetuser="${u.id}">${t('aResetOne')}</button>
        </div>`).join('')
    : `<p class="muted">${t('aNoUsers')}</p>`;

  show(`${backBtn()}
    <section class="card"><h2>⚙ ${t('adminTitle')}</h2>
      <div class="stat" style="margin-top:12px">
        <div class="full">${t('aTotalUsers')}<b>${ov.totalUsers}</b></div>
        <div>${t('aToday')}<b>${ov.today}</b></div>
        <div>${t('aMonth')}<b>${ov.month}</b></div>
        <div class="full">${t('aYear')}<b>${ov.year}</b></div>
      </div></section>
    <section class="card"><h3>${t('aActive')} (${ov.active})</h3>${activeHtml}</section>
    <section class="card"><h3>❗ ${t('aCancelled')}</h3>${cancHtml}</section>
    <section class="card"><h3>📅 ${t('aDayOff')}</h3>
      <label class="l">${t('aDate')}</label><input id="offDate" type="date" min="${state.config.today}">
      <div class="row"><div><label class="l">${t('aFrom')}</label><input id="offFrom" type="time"></div>
      <div><label class="l">${t('aTo')}</label><input id="offTo" type="time"></div></div>
      <label class="l">${t('aComment')}</label><textarea id="offReason" maxlength="500"></textarea>
      <button class="cta" id="offSave">${t('aSetDayOff')}</button>
      ${offsHtml ? `<h3 style="margin-top:18px">${t('aDayOffList')}</h3>${offsHtml}` : ''}</section>
    <section class="card"><h3>📢 ${t('aBroadcast')}</h3>
      <textarea id="bc" maxlength="3000" placeholder="${t('aBroadcastPh')}"></textarea>
      <button class="cta" id="bcSend">${t('aSend')}</button></section>
    <section class="card"><h3>🔄 ${t('aResetTitle')}</h3>
      <p class="muted">${t('aResetDesc')}</p>
      <button class="danger" id="resetAll" style="width:100%;margin-top:12px">${t('aResetAll')}</button></section>
    <section class="card"><h3>👥 ${t('aUsers')} (${usr.users.length})</h3>${usersHtml}</section>`);

  app.querySelectorAll('[data-st]').forEach((b) => {
    b.onclick = async () => {
      const ask = b.dataset.st === 'COMPLETED' ? t('aAskArrived') : t('aAskNoShow');
      if (!confirm(ask)) return;
      b.disabled = true;
      try {
        await api(`/admin/bookings/${b.dataset.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: b.dataset.st }) });
        toast(t('aStatusOk'));
        viewAdmin();
      } catch (e) { toast(e.message, true); b.disabled = false; }
    };
  });

  app.querySelectorAll('[data-deloff]').forEach((b) => {
    b.onclick = async () => {
      try {
        await api('/admin/day-off/' + b.dataset.deloff, { method: 'DELETE' });
        toast(t('aDeleted'));
        viewAdmin();
      } catch (e) { toast(e.message, true); }
    };
  });

  const doReset = async (userId, ask) => {
    if (!confirm(ask)) return;
    try {
      await api('/admin/reset-stats', { method: 'POST', body: JSON.stringify(userId ? { userId } : {}) });
      toast(t('aResetOk'));
      viewAdmin();
    } catch (e) { toast(e.message, true); }
  };
  $('#resetAll').onclick = () => doReset(null, t('aResetAskAll'));
  app.querySelectorAll('[data-resetuser]').forEach((b) => {
    b.onclick = () => doReset(b.dataset.resetuser, t('aResetAskOne'));
  });

  $('#offSave').onclick = async () => {
    const date = $('#offDate').value, reason = $('#offReason').value.trim();
    const startTime = $('#offFrom').value, endTime = $('#offTo').value;
    if (!date || !reason) { toast(t('fill'), true); return; }
    $('#offSave').disabled = true;
    try {
      const r = await api('/admin/day-off', {
        method: 'POST',
        body: JSON.stringify({ date, reason, startTime: startTime || null, endTime: endTime || null })
      });
      toast(t('aDayOffOk') + (r.conflicts ? ` ⚠️ ${r.conflicts} ${t('aConflict')}` : ''));
      viewAdmin();
    } catch (e) { toast(e.message, true); $('#offSave').disabled = false; }
  };

  $('#bcSend').onclick = async () => {
    const text = $('#bc').value.trim();
    if (!text) { toast(t('fill'), true); return; }
    $('#bcSend').disabled = true;
    try {
      const r = await api('/admin/broadcast', { method: 'POST', body: JSON.stringify({ text }) });
      toast(`${r.deliveredTo} ${t('aSent')}`);
      $('#bc').value = '';
    } catch (e) { toast(e.message, true); }
    $('#bcSend').disabled = false;
  };
}

route();