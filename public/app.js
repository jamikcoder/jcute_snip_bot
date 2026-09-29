const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const API = '/api';
const app = document.querySelector('#app');

// ===== I18N =====
const I18N = {
  uz: {
    welcome: 'Xush kelibsiz!',
    subtitle: 'Yangi Era — O\'zbekiston uchun !',
    description: 'Barcha qulayliklar qadrli mijozlar uchun. Ishonchingiz uchun rahmat.',
    book: 'Navbat olish',
    lists: 'Barcha ro\'yxatlar',
    cabinet: 'Shaxsiy kabinet',
    location: 'Lokatsiya',
    prices: 'Narxlar',
    admin: 'Admin panel',
    registerTitle: 'Ro\'yxatdan o\'tish',
    registerDesc: 'Navbat olish uchun ma\'lumotlaringizni kiriting.',
    firstName: 'Ism',
    lastName: 'Familiya',
    phone: 'Telefon raqam',
    birthDate: 'Tug\'ilgan sana',
    continue: 'Davom etish →',
    selectServices: 'Xizmatlarni tanlang',
    total: 'Jami',
    freeSlots: 'Bo\'sh vaqtlar',
    cash: 'Naqd',
    card: 'Karta orqali',
    contactPhone: 'Bog\'lanish uchun raqam',
    confirmBooking: 'Navbatni tasdiqlash',
    cabinetTitle: 'Shaxsiy kabinet',
    visits: 'Tashriflar',
    spent: 'Jami sarf',
    reliability: 'Ishonchlilik',
    activeBookings: 'Faol navbat',
    myBookings: 'Mening navbatlarim',
    cancel: 'Bekor qilish',
    noActive: 'Faol navbat yo\'q.',
    listsTitle: 'Ro\'yxatlar',
    noBookings: 'Hozircha band vaqt yo\'q.',
    pricesTitle: 'Narxlar',
    adminTitle: 'Admin panel',
    todayClients: 'Bugungi mijoz',
    todayIncome: 'Bugungi daromad',
    monthClients: 'Oylik mijoz',
    monthIncome: 'Oylik daromad',
    totalUsers: 'Jami mijozlar',
    totalBookings: 'Jami navbatlar',
    yearIncome: 'Yillik daromad',
    completed: 'Yakunlangan',
    broadcast: 'Hammaga xabar yuborish',
    broadcastPlaceholder: 'Xabar matni...',
    send: 'Yuborish',
    dayOffs: 'Dam olish kunlari',
    dayOffDate: 'Sana',
    dayOffReason: 'Sabab',
    add: '+',
    delete: 'O\'chirish',
    todayBookings: 'Bugungi navbatlar',
    arrived: 'Keldi',
    noShow: 'Kelmadi',
    manageBookings: 'Navbatlarni boshqarish',
    resetDay: 'Kunni reset qilish',
    recentBookings: 'So\'nggi navbatlar',
    users: 'Foydalanuvchilar',
    globalReset: 'BARCHA MA\'LUMOTLARNI RESET QILISH',
    globalResetConfirm: 'Barcha mijozlar, navbatlar va daromadlar o\'chiriladi. Davom etasizmi?',
    cancelReason: 'Bekor qilish sababini yozing:',
    noAccess: 'Sizda adminlik huquqi yo\'q',
    selectDate: 'Sanani tanlang',
    selectTime: 'Vaqtni tanlang',
    selectService: 'Kamida bitta xizmat tanlang.',
    bookingSuccess: 'Navbatingiz muvaffaqiyatli band qilindi!',
    cancelSuccess: 'Navbat bekor qilindi.',
    statusUpdated: 'Status yangilandi.',
    dayOffAdded: 'Dam olish kuni qo\'shildi.',
    dayOffDeleted: 'Dam olish kuni o\'chirildi.',
    resetSuccess: ' ta navbat bekor qilindi.',
    globalResetSuccess: 'Barcha ma\'lumotlar tozalandi.',
    emptyField: 'Barcha maydonlarni to\'ldiring.',
    error: 'Xatolik',
    reload: 'Qayta yuklash',
    loading: 'Yuklanmoqda...',
    wait: 'Iltimos, kuting',
    back: 'Orqaga',
    adult: 'Kattalar',
    kids: 'Kichkinalar',
    other: 'Boshqa',
    dayOff: 'Bu kun dam olish kuni.',
    noFreeSlots: 'Bo\'sh vaqt yo\'q.',
    selectServiceFirst: 'Xizmat tanlang.',
    booked: 'band',
    noBookingsDay: 'Bugun navbat yo\'q.',
    noBookingsRecent: 'Navbatlar yo\'q.',
    noUsers: 'Foydalanuvchilar yo\'q.',
    noDayOffs: 'Dam olish kunlari yo\'q.'
  },
  ru: {
    welcome: 'Добро пожаловать!',
    subtitle: 'Новая Эра — для Узбекистана !',
    description: 'Все удобства для ценных клиентов. Спасибо за доверие.',
    book: 'Записаться',
    lists: 'Все записи',
    cabinet: 'Личный кабинет',
    location: 'Локация',
    prices: 'Цены',
    admin: 'Админ панель',
    registerTitle: 'Регистрация',
    registerDesc: 'Введите данные для записи.',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Номер телефона',
    birthDate: 'Дата рождения',
    continue: 'Продолжить →',
    selectServices: 'Выберите услуги',
    total: 'Итого',
    freeSlots: 'Свободное время',
    cash: 'Наличные',
    card: 'По карте',
    contactPhone: 'Контактный номер',
    confirmBooking: 'Подтвердить запись',
    cabinetTitle: 'Личный кабинет',
    visits: 'Визиты',
    spent: 'Всего потрачено',
    reliability: 'Надежность',
    activeBookings: 'Активные записи',
    myBookings: 'Мои записи',
    cancel: 'Отменить',
    noActive: 'Нет активных записей.',
    listsTitle: 'Записи',
    noBookings: 'Пока нет записей.',
    pricesTitle: 'Цены',
    adminTitle: 'Админ панель',
    todayClients: 'Клиенты сегодня',
    todayIncome: 'Доход сегодня',
    monthClients: 'Клиенты за месяц',
    monthIncome: 'Доход за месяц',
    totalUsers: 'Всего клиентов',
    totalBookings: 'Всего записей',
    yearIncome: 'Годовой доход',
    completed: 'Завершено',
    broadcast: 'Отправить всем',
    broadcastPlaceholder: 'Текст сообщения...',
    send: 'Отправить',
    dayOffs: 'Выходные дни',
    dayOffDate: 'Дата',
    dayOffReason: 'Причина',
    add: '+',
    delete: 'Удалить',
    todayBookings: 'Записи на сегодня',
    arrived: 'Пришел',
    noShow: 'Не пришел',
    manageBookings: 'Управление записями',
    resetDay: 'Сбросить день',
    recentBookings: 'Последние записи',
    users: 'Пользователи',
    globalReset: 'СБРОСИТЬ ВСЕ ДАННЫЕ',
    globalResetConfirm: 'Все клиенты, записи и доходы будут удалены. Продолжить?',
    cancelReason: 'Укажите причину отмены:',
    noAccess: 'У вас нет прав администратора',
    selectDate: 'Выберите дату',
    selectTime: 'Выберите время',
    selectService: 'Выберите хотя бы одну услугу.',
    bookingSuccess: 'Запись успешно подтверждена!',
    cancelSuccess: 'Запись отменена.',
    statusUpdated: 'Статус обновлен.',
    dayOffAdded: 'Выходной день добавлен.',
    dayOffDeleted: 'Выходной день удален.',
    resetSuccess: ' записей отменено.',
    globalResetSuccess: 'Все данные очищены.',
    emptyField: 'Заполните все поля.',
    error: 'Ошибка',
    reload: 'Перезагрузить',
    loading: 'Загрузка...',
    wait: 'Пожалуйста, подождите',
    back: 'Назад',
    adult: 'Взрослые',
    kids: 'Дети',
    other: 'Другие',
    dayOff: 'Это выходной день.',
    noFreeSlots: 'Нет свободного времени.',
    selectServiceFirst: 'Выберите услугу.',
    booked: 'занято',
    noBookingsDay: 'Сегодня нет записей.',
    noBookingsRecent: 'Нет записей.',
    noUsers: 'Нет пользователей.',
    noDayOffs: 'Нет выходных дней.'
  }
};

let currentLang = localStorage.getItem('jcute_lang') || 'uz';
const t = (key) => I18N[currentLang][key] || key;

// Xizmatlar serverdan o'zbekcha nom bilan keladi. Interfeys tili ruscha bo'lsa,
// shu ID bo'yicha hamma ekranda bir xil ruscha nom ko'rsatiladi.
const SERVICE_NAMES_RU = {
  adult_haircut_standard: 'Мужская стрижка — стандарт',
  adult_haircut_creative: 'Мужская стрижка — креатив',
  kids_haircut_standard: 'Детская стрижка — стандарт',
  kids_haircut_creative: 'Детская стрижка — креатив',
  beard: 'Стрижка бороды',
  lineup: 'Окантовка',
  mask: 'Маска для лица',
  coloring: 'Окрашивание волос',
  depilation: 'Депиляция',
  zero_cut: 'Стрижка наголо (под 0)'
};

function serviceName(serviceOrId) {
  const service = typeof serviceOrId === 'string'
    ? state.config?.services?.find((item) => item.id === serviceOrId)
    : serviceOrId;
  if (!service) return typeof serviceOrId === 'string' ? serviceOrId : '';
  return currentLang === 'ru' ? (SERVICE_NAMES_RU[service.id] || service.name) : service.name;
}

const state = {
  date: new Date().toISOString().slice(0, 10),
  services: [],
  slot: '',
  paymentMethod: 'CASH',
  telegramId: tg?.initDataUnsafe?.user?.id || localStorage.getItem('demoTelegramId') || '719139730',
  config: null
};

const money = (n) => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";

const toast = (text) => {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 3500);
};

async function request(url, options = {}) {
  const r = await fetch(API + url, {
    headers: {
      'content-type': 'application/json',
      'x-telegram-id': state.telegramId,
      ...options.headers
    },
    ...options
  });
  // Server xato sahifasini HTML qilib yuborsa, foydalanuvchiga texnik JSON xatosi
  // emas, tushunarli xabar ko'rsatamiz.
  const raw = await r.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Server rasmni qabul qila olmadi. Rasmni kichraytirib, qayta urinib ko\'ring.');
  }
  if (!r.ok) throw new Error(data.error || 'Xatolik');
  return data;
}

function nav(view) {
  location.hash = view;
  render();
}

function goBack() {
  nav('home');
}

function todayOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function backButtonHtml() {
  return '<button class="back" onclick="window.__goBack()">← ' + t('back') + '</button>';
}

window.__goBack = goBack;

function languageSelect() {
  app.innerHTML =
    '<section class="card"><h2>jcute_snip</h2><p class="muted">Tilni tanlang / Выберите язык</p>' +
    '<div class="lang-select">' +
    '<button class="lang-btn" onclick="window.__setLang(\'uz\')">🇺🇿 O\'zbek tili</button>' +
    '<button class="lang-btn" onclick="window.__setLang(\'ru\')">🇷🇺 Русский язык</button>' +
    '</div></section>';
}

window.__setLang = (lang) => {
  currentLang = lang;
  localStorage.setItem('jcute_lang', lang);
  render();
};

function home() {
  try {
    const isAdmin = String(state.telegramId) === String(state.config?.adminId);
    app.innerHTML =
      '<section class="card"><h2>' + t('welcome') + '</h2><p class="muted">' + t('subtitle') + '</p><p class="muted" style="margin-top:8px">' + t('description') + '</p><div class="menu"><button class="primary" data-nav="book"><span class="icon">＋</span>' + t('book') + '</button><button data-nav="lists"><span class="icon">☷</span>' + t('lists') + '</button><button data-nav="cabinet"><span class="icon">◉</span>' + t('cabinet') + '</button><button data-location><span class="icon">⌖</span>' + t('location') + '</button><button data-nav="prices"><span class="icon">₸</span>' + t('prices') + '</button>' +
      (isAdmin ? '<button data-nav="admin"><span class="icon">⚙</span>' + t('admin') + '</button>' : '') +
      '</div></section>';
    attachNavListeners();
  } catch (e) {
    console.error('Home xatosi:', e);
    app.innerHTML = '<section class="card"><h2>' + t('error') + '</h2><p class="muted">Menyu yuklanmadi</p></section>';
  }
}

function register() {
  app.innerHTML =
    '<section class="card">' +
    backButtonHtml() +
    '<h2>' + t('registerTitle') + '</h2><p class="muted">' + t('registerDesc') + '</p><label>' + t('firstName') + '</label><input id="first" placeholder="Jamshid"><label>' + t('lastName') + '</label><input id="last" placeholder="Boishov"><label>' + t('phone') + '</label><input id="phone" type="tel" placeholder="+998 94 215 41 24"><label>' + t('birthDate') + '</label><input id="birth" type="date"><button class="cta" id="save-profile">' + t('continue') + '</button></section>';

  document.querySelector('#save-profile').onclick = async () => {
    const btn = document.querySelector('#save-profile');
    btn.textContent = t('loading');
    btn.disabled = true;
    try {
      const firstName = document.querySelector('#first').value.trim();
      const lastName = document.querySelector('#last').value.trim();
      const phone = document.querySelector('#phone').value.trim();
      const birthDate = document.querySelector('#birth').value;

      if (!firstName || !lastName || !phone || !birthDate) {
        throw new Error(t('emptyField'));
      }

      await request('/register', {
        method: 'POST',
        body: JSON.stringify({
          telegramId: state.telegramId,
          firstName,
          lastName,
          phone,
          birthDate
        })
      });

      toast(currentLang === 'uz' ? "Ro'yxatdan o'tish muvaffaqiyatli!" : 'Регистрация успешна!');
      nav('book');
    } catch (e) {
      console.error('Register xatosi:', e);
      alert(t('error') + ': ' + e.message);
    } finally {
      btn.textContent = t('continue');
      btn.disabled = false;
    }
  };
}

function selectedTotal() {
  if (!state.config?.services) return { price: 0, minutes: 0 };
  return state.services.reduce(
    (a, id) => {
      const s = state.config.services.find((x) => x.id === id);
      if (!s) return a;
      return { price: a.price + s.price, minutes: a.minutes + s.minutes };
    },
    { price: 0, minutes: 0 }
  );
}

function renderServiceList(services) {
  const groups = {};
  services.forEach((s) => {
    const g = s.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(s);
  });

  let html = '';
  const groupLabels = { adult: t('adult'), kids: t('kids'), other: t('other') };

  for (const [group, items] of Object.entries(groups)) {
    if (group !== 'other') {
      html += '<div class="service-group-label">' + groupLabels[group] + '</div>';
    }
    const hasHair = state.services.some((id) => id.startsWith('adult_haircut') || id.startsWith('kids_haircut'));
    html += items.map((s) => {
      const disabled = s.id === 'lineup' && hasHair;
      return '<label class="service"><span><input type="checkbox" value="' + s.id + '"' +
        (state.services.includes(s.id) ? ' checked' : '') +
        (disabled ? ' disabled' : '') +
        '> ' + serviceName(s) +
        '</span><span class="price">' + money(s.price) + ' · ' + s.minutes + 'd</span></label>';
    }).join('');
  }
  return html;
}

async function booking() {
  let user;
  try {
    user = await request('/me/' + state.telegramId);
  } catch (e) {
    console.error('Profil xatosi:', e);
    register();
    return;
  }

  if (!state.config?.services) {
    app.innerHTML = '<section class="card"><h2>' + t('error') + '</h2><p class="muted">Servislar ro\'yxati yuklanmadi</p></section>';
    return;
  }

  const services = state.config.services;

  app.innerHTML =
    '<section class="card">' +
    backButtonHtml() +
    '<h2>' + t('book') + '</h2><div class="row tabs"><button class="day-tab" data-day="0">' + (currentLang === 'uz' ? 'Bugun' : 'Сегодня') + '</button><button class="day-tab" data-day="1">' + (currentLang === 'uz' ? 'Ertaga' : 'Завтра') + '</button><button class="day-tab" id="other">' + (currentLang === 'uz' ? 'Boshqa' : 'Другая') + '</button></div><input id="date" type="date" min="' +
    todayOffset(0) +
    '" max="' +
    new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10) +
    '" value="' +
    state.date +
    '"><h3>' + t('selectServices') + '</h3><div id="service-list"></div><div class="total"><span>' + t('total') + '</span><b id="total">0 so\'m · 0 daqiqa</b></div><p class="small">' + t('freeSlots') + '</p><div id="slots" class="slots"></div><div class="pay row"><button data-pay="CASH" class="active">' + t('cash') + '</button><button data-pay="CARD">' + t('card') + '</button></div><p id="card" class="small"></p><label>' + t('contactPhone') + '</label><input id="contact" value="' +
    (user?.user?.phone || '') +
    '"><button class="cta" id="confirm">' + t('confirmBooking') + '</button></section>';

  function updateTabs() {
    const today = todayOffset(0);
    const tomorrow = todayOffset(1);
    document.querySelectorAll('.day-tab').forEach((btn) => {
      btn.classList.remove('active');
      if (btn.dataset.day === '0' && state.date === today) btn.classList.add('active');
      if (btn.dataset.day === '1' && state.date === tomorrow) btn.classList.add('active');
    });
  }

  const update = async () => {
    try {
      updateTabs();
      document.querySelector('#service-list').innerHTML = renderServiceList(services);

      const t = selectedTotal();
      document.querySelector('#total').textContent = money(t.price) + ' · ' + t.minutes + ' ' + (currentLang === 'uz' ? 'daqiqa' : 'мин');

      if (t.minutes) {
        try {
          const data = await request(
            '/slots?date=' + state.date + '&services=' + state.services.join(',')
          );
          if (data.dayOff) {
            document.querySelector('#slots').innerHTML =
              '<span class="small" style="color:#ff6b6b">' +
              (data.reason || t('dayOff')) +
              '</span>';
          } else {
            document.querySelector('#slots').innerHTML =
              data.slots
                .map(
                  (x) =>
                    '<button class="slot' +
                    (state.slot === x ? ' active' : '') +
                    '" data-slot="' +
                    x +
                    '">' +
                    x +
                    '</button>'
                )
                .join('') || '<span class="small">' + t('noFreeSlots') + '</span>';
          }
        } catch (e) {
          toast(e.message);
        }
      } else {
        document.querySelector('#slots').innerHTML = '<span class="small">' + t('selectServiceFirst') + '</span>';
      }
    } catch (e) {
      console.error('Update xatosi:', e);
    }
  };

  document.querySelector('#service-list').addEventListener('change', () => {
    state.services = [...document.querySelectorAll('#service-list input:checked')].map(
      (x) => x.value
    );
    state.slot = '';
    update();
  });

  document.querySelectorAll('.day-tab[data-day]').forEach((b) => {
    b.onclick = () => {
      state.date = todayOffset(+b.dataset.day);
      document.querySelector('#date').value = state.date;
      state.slot = '';
      update();
    };
  });

  document.querySelector('#other').onclick = () => {
    document.querySelector('#date').showPicker?.();
  };

  document.querySelector('#date').onchange = (e) => {
    state.date = e.target.value;
    state.slot = '';
    update();
  };

  document.querySelector('#slots').onclick = (e) => {
    if (e.target.dataset.slot) {
      state.slot = e.target.dataset.slot;
      update();
    }
  };

  document.querySelectorAll('[data-pay]').forEach((b) => {
    b.onclick = () => {
      state.paymentMethod = b.dataset.pay;
      document.querySelectorAll('[data-pay]').forEach((x) => x.classList.toggle('active', x === b));
      document.querySelector('#card').textContent =
        state.paymentMethod === 'CARD'
          ? 'Karta: ' + state.config.card + ' — ' + state.config.cardOwner
          : '';
    };
  });

  document.querySelector('#confirm').onclick = async () => {
    try {
      if (!state.slot) throw new Error(t('selectTime'));
      if (state.services.length === 0) throw new Error(t('selectService'));

      await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          telegramId: state.telegramId,
          date: state.date,
          startTime: state.slot,
          services: state.services,
          paymentMethod: state.paymentMethod,
          contactPhone: document.querySelector('#contact').value
        })
      });

      toast(t('bookingSuccess'));
      nav('cabinet');
    } catch (e) {
      toast(e.message);
    }
  };

  update();
}

async function cabinet() {
  try {
    const me = await request('/me/' + state.telegramId);
    const upcoming = me.user.bookings.filter((b) => b.status === 'BOOKED');

    app.innerHTML =
      '<section class="card">' +
      backButtonHtml() +
      '<h2>' + t('cabinetTitle') + '</h2><div class="stat"><div>' + t('visits') + '<b>' +
      me.visits +
      '</b></div><div>' + t('spent') + '<b>' +
      money(me.spent) +
      '</b></div><div>' + t('reliability') + '<b>' +
      me.reliability +
      '%</b></div><div>' + t('activeBookings') + '<b>' +
      upcoming.length +
      '</b></div></div></section>' +
      '<section class="card"><button class="primary" data-nav="ai" style="width:100%;margin-bottom:0;"><span class="icon">✨</span>' + t('aiAssistant') + '</button></section>' +
      '<section class="card"><h2>' + t('myBookings') + '</h2>' +
      (upcoming.length
        ? upcoming
            .map(
              (b) =>
                '<div class="booking"><b>' +
                b.date.slice(0, 10) +
                ' · ' +
                b.startTime +
                '</b><br><span class="small">' +
                b.services
                  .map((id) => serviceName(id))
                  .join(', ') +
                ' · ' +
                money(b.totalPrice) +
                '</span><button class="danger" data-cancel="' +
                b.id +
                '">' + t('cancel') + '</button></div>'
            )
            .join('')
        : '<p class="muted">' + t('noActive') + '</p>') +
      '</section>';

    // AI tugmasi uchun listener
    const aiBtn = document.querySelector('[data-nav="ai"]');
    if (aiBtn) aiBtn.onclick = () => nav('ai');

    document.querySelectorAll('[data-cancel]').forEach((x) => {
      x.onclick = async () => {
        const reason = prompt(t('cancelReason'));
        if (!reason) return;
        try {
          await request('/bookings/' + x.dataset.cancel + '/cancel', {
            method: 'POST',
            body: JSON.stringify({ reason })
          });
          toast(t('cancelSuccess'));
          cabinet();
        } catch (e) {
          toast(e.message);
        }
      };
    });
  } catch (e) {
    console.error('Cabinet xatosi:', e);
    register();
  }
}

async function lists() {
  try {
    const data = await request('/day/' + state.date);

    app.innerHTML =
      '<section class="card">' +
      backButtonHtml() +
      '<h2>' + t('listsTitle') + '</h2><input id="list-date" type="date" value="' +
      state.date +
      '" min="' +
      todayOffset(0) +
      '"><p class="small">' + (currentLang === 'uz' ? 'Tanlangan kun: ' : 'Выбранная дата: ') + state.date +
      '</p>' +
      (data
        .filter((x) => x.status === 'BOOKED')
        .map(
          (x) =>
            '<div class="booking"><b>' +
            x.startTime +
            '–' +
            x.endTime +
            '</b><span class="small"> · ' + t('booked') + '</span></div>'
        )
        .join('') || '<p class="muted">' + t('noBookings') + '</p>') +
      '</section>';

    document.querySelector('#list-date').onchange = (e) => {
      state.date = e.target.value;
      lists();
    };
  } catch (e) {
    toast(e.message);
  }
}

function prices() {
  try {
    if (!state.config?.services) {
      app.innerHTML = '<section class="card"><h2>' + t('error') + '</h2><p class="muted">Narxlar ro\'yxati yuklanmadi</p></section>';
      return;
    }
    app.innerHTML =
      '<section class="card">' +
      backButtonHtml() +
      '<h2>' + t('pricesTitle') + '</h2>' +
      state.config.services
        .map(
          (s) =>
            '<div class="service"><b>' +
            serviceName(s) +
            '</b><span class="price">' +
            money(s.price) +
            ' · ' +
            s.minutes +
            ' ' + (currentLang === 'uz' ? 'daqiqa' : 'мин') +
            '</span></div>'
        )
        .join('') +
      '</section>';
  } catch (e) {
    console.error('Prices xatosi:', e);
  }
}

async function admin() {
  if (String(state.telegramId) !== String(state.config?.adminId)) {
    alert(t('noAccess'));
    goBack();
    return;
  }
  try {
    const [overview, stats, todayBookings, allBookings, users, dayOffs] = await Promise.all([
      request('/admin/overview').catch(() => null),
      request('/admin/stats').catch(() => null),
      request('/day/' + todayOffset(0)).catch(() => []),
      request('/admin/bookings?limit=20').catch(() => []),
      request('/admin/users').catch(() => []),
      request('/admin/day-off').catch(() => [])
    ]);

    app.innerHTML =
      '<section class="card">' +
      backButtonHtml() +
      '<h2>' + t('adminTitle') + '</h2>' +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + (currentLang === 'uz' ? 'Umumiy ko\'rsatkichlar' : 'Общие показатели') + '</h3>' +
      '<div class="stat"><div>' + t('todayClients') + '<b>' +
      (overview?.todayClients || 0) +
      '</b></div><div>' + t('todayIncome') + '<b>' +
      money(overview?.todayIncome || 0) +
      '</b></div><div>' + t('monthClients') + '<b>' +
      (overview?.monthClients || 0) +
      '</b></div><div>' + t('monthIncome') + '<b>' +
      money(overview?.monthIncome || 0) +
      '</b></div></div>' +
      '<div class="stat"><div>' + t('totalUsers') + '<b>' +
      (overview?.totalUsers || 0) +
      '</b></div><div>' + t('totalBookings') + '<b>' +
      (overview?.totalBookings || 0) +
      '</b></div><div>' + t('yearIncome') + '<b>' +
      money(stats?.year?.income || 0) +
      '</b></div><div>' + t('completed') + '<b>' +
      (stats?.byStatus?.completed || 0) +
      '</b></div></div>' +
      '<div class="global-reset">' +
      '<button class="danger" id="global-reset" style="width:100%">' + t('globalReset') + '</button>' +
      '</div>' +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('broadcast') + '</h3>' +
      '<textarea id="broadcast" placeholder="' + t('broadcastPlaceholder') + '" style="width:100%;min-height:80px;background:rgba(255,255,255,0.04);border:1px solid rgba(0,255,170,0.1);border-radius:12px;padding:12px;color:#e8f0ec;resize:vertical"></textarea>' +
      '<button class="cta" id="send-broadcast" style="margin-top:10px">' + t('send') + '</button>' +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('dayOffs') + '</h3>' +
      '<div class="row" style="margin-bottom:10px"><input id="dayoff-date" type="date" style="flex:1"><input id="dayoff-reason" placeholder="' + t('dayOffReason') + '" style="flex:2"><button id="add-dayoff" class="primary" style="padding:12px 20px">' + t('add') + '</button></div>' +
      (dayOffs.length
        ? dayOffs
            .map(
              (d) =>
                '<div class="booking" style="display:flex;justify-content:space-between;align-items:center"><span>' +
                d.date.slice(0, 10) +
                ' — ' +
                d.reason +
                '</span><button class="danger" data-del-dayoff="' +
                d.date.slice(0, 10) +
                '" style="width:auto;padding:6px 12px;font-size:12px">' + t('delete') + '</button></div>'
            )
            .join('')
        : '<p class="muted">' + t('noDayOffs') + '</p>') +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('todayBookings') + '</h3>' +
      (todayBookings
        .filter((b) => b.status === 'BOOKED')
        .map(
          (b) =>
            '<div class="booking"><b>' +
            b.startTime +
            ' · ' +
            b.user.firstName +
            ' ' +
            b.user.lastName +
            '</b><br><span class="small">' +
            b.contactPhone +
            ' · ' +
            money(b.totalPrice) +
            ' · ' +
            b.services
              .map((id) => serviceName(id))
              .join(', ') +
            '</span><div class="row" style="margin-top:8px"><button data-status="COMPLETED" data-id="' +
            b.id +
            '">' + t('arrived') + '</button><button data-status="NO_SHOW" data-id="' +
            b.id +
            '" class="danger">' + t('noShow') + '</button></div></div>'
        )
        .join('') || '<p class="muted">' + t('noBookingsDay') + '</p>') +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('manageBookings') + '</h3>' +
      '<div class="row" style="margin-bottom:10px"><input id="reset-date" type="date" value="' +
      todayOffset(0) +
      '" style="flex:1"><button id="reset-day" class="danger" style="flex:1">' + t('resetDay') + '</button></div>' +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('recentBookings') + '</h3>' +
      (allBookings
        .map(
          (b) =>
            '<div class="booking"><b>' +
            b.date.slice(0, 10) +
            ' ' +
            b.startTime +
            '</b> <span style="color:' +
            (b.status === 'BOOKED'
              ? '#00ffa8'
              : b.status === 'COMPLETED'
                ? '#4ecdc4'
                : '#ff6b6b') +
            '">' +
            b.status +
            '</span><br><span class="small">' +
            b.user.firstName +
            ' ' +
            b.user.lastName +
            ' · ' +
            b.contactPhone +
            ' · ' +
            money(b.totalPrice) +
            '</span></div>'
        )
        .join('') || '<p class="muted">' + t('noBookingsRecent') + '</p>') +
      '<h3 style="margin:20px 0 10px;font-size:14px;color:#7a8b82;text-transform:uppercase">' + t('users') + '</h3>' +
      (users
        .map(
          (u) =>
            '<div class="booking"><b>' +
            u.firstName +
            ' ' +
            u.lastName +
            '</b><br><span class="small">' +
            u.phone +
            ' · ' +
            u.totalBookings +
            ' ' + (currentLang === 'uz' ? 'ta navbat' : 'записей') +
            ' · ' +
            (u.birthDate ? u.birthDate.slice(0, 10) : '-') +
            '</span></div>'
        )
        .join('') || '<p class="muted">' + t('noUsers') + '</p>') +
      '</section>';

    document.querySelector('#global-reset').onclick = async () => {
      if (!confirm(t('globalResetConfirm'))) return;
      try {
        await request('/admin/global-reset', { method: 'POST' });
        toast(t('globalResetSuccess'));
        admin();
      } catch (e) {
        toast(e.message);
      }
    };

    document.querySelector('#send-broadcast').onclick = async () => {
      try {
        const text = document.querySelector('#broadcast').value.trim();
        if (!text) throw new Error(t('emptyField'));
        const data = await request('/admin/broadcast', {
          method: 'POST',
          body: JSON.stringify({ text })
        });
        toast(data.deliveredTo + ' ' + (currentLang === 'uz' ? 'foydalanuvchiga yuborildi.' : 'пользователям отправлено.'));
      } catch (e) {
        toast(e.message);
      }
    };

    document.querySelectorAll('[data-status]').forEach((x) => {
      x.onclick = async () => {
        try {
          await request('/admin/bookings/' + x.dataset.id + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status: x.dataset.status })
          });
          toast(t('statusUpdated'));
          admin();
        } catch (e) {
          toast(e.message);
        }
      };
    });

    document.querySelector('#add-dayoff').onclick = async () => {
      try {
        const date = document.querySelector('#dayoff-date').value;
        const reason = document.querySelector('#dayoff-reason').value.trim();
        if (!date || !reason) throw new Error(t('emptyField'));
        await request('/admin/day-off', {
          method: 'POST',
          body: JSON.stringify({ date, reason })
        });
        toast(t('dayOffAdded'));
        admin();
      } catch (e) {
        toast(e.message);
      }
    };

    document.querySelectorAll('[data-del-dayoff]').forEach((x) => {
      x.onclick = async () => {
        try {
          await request('/admin/day-off/' + x.dataset.delDayoff, { method: 'DELETE' });
          toast(t('dayOffDeleted'));
          admin();
        } catch (e) {
          toast(e.message);
        }
      };
    });

    document.querySelector('#reset-day').onclick = async () => {
      try {
        const date = document.querySelector('#reset-date').value;
        if (!date) throw new Error(t('selectDate'));
        if (!confirm(date + (currentLang === 'uz' ? " kungi barcha navbatlarni bekor qilmoqchimisiz?" : ' — отменить все записи на этот день?'))) return;
        const data = await request('/admin/reset-day/' + date, { method: 'POST' });
        toast(data.count + t('resetSuccess'));
        admin();
      } catch (e) {
        toast(e.message);
      }
    };
  } catch (e) {
    console.error('Admin xatosi:', e);
    toast(e.message);
    goBack();
  }
}

function attachNavListeners() {
  document.querySelectorAll('[data-nav]').forEach((b) => {
    b.onclick = () => nav(b.dataset.nav);
  });
  const locBtn = document.querySelector('[data-location]');
  if (locBtn && state.config?.locationUrl) {
    locBtn.addEventListener('click', () => window.open(state.config.locationUrl, '_blank'));
  }
}

async function render() {
  try {
        if (tg?.initDataUnsafe?.user?.id) {
      state.telegramId = String(tg.initDataUnsafe.user.id);
    }
    if (!state.config) {
      app.innerHTML = '<section class="card"><h2>' + t('loading') + '</h2><p class="muted">' + t('wait') + '</p></section>';
      state.config = await request('/config');
    }

    if (!localStorage.getItem('jcute_lang')) {
      languageSelect();
      return;
    }

    const v = location.hash.slice(1) || 'home';
    if (v === 'book') await booking();
    else if (v === 'cabinet') await cabinet();
    else if (v === 'lists') await lists();
    else if (v === 'prices') prices();
        else if (v === 'admin') await admin();
    else if (v === 'ai') await aiAssistant();
    else home();
  } catch (err) {
    console.error('Render xatosi:', err);
    app.innerHTML = '<section class="card"><h2>' + t('error') + '</h2><p class="muted">' + (err.message || 'Sahifa yuklanmadi. Internetni tekshiring.') + '</p><button class="primary" onclick="location.reload()" style="margin-top:16px">' + t('reload') + '</button></section>';
  }
}

window.addEventListener('hashchange', render);

async function aiAssistant() {
  app.innerHTML =
    '<section class="card">' +
    backButtonHtml() +
    '<h2>✨ ' + t('jcute_snip yordamchi') + '</h2>' +
    '<p class="muted">' + t('aiDesc') + '</p>' +
    '<div id="chat-history" style="max-height:400px;overflow-y:auto;margin:16px 0;display:flex;flex-direction:column;gap:10px;"></div>' +
    '<div id="image-preview" style="display:none;margin-bottom:10px;"><img id="preview-img" style="max-width:100%;border-radius:12px;border:1px solid rgba(0,255,170,0.2);"></div>' +
    '<div class="row" style="gap:8px;align-items:center;">' +
    '<input type="file" id="ai-image" accept="image/*" style="display:none;">' +
    '<button onclick="document.getElementById(\'ai-image\').click()" style="width:auto;padding:10px 14px;font-size:18px;background:rgba(255,255,255,0.05);border:1px solid rgba(0,255,170,0.2);border-radius:12px;color:#00ffa8;cursor:pointer;">📷</button>' +
    '<input id="ai-message" placeholder="' + t('Murojatingizni kiriting') + '" style="flex:1;">' +
    '<button class="primary" id="ai-send" style="width:auto;padding:10px 16px;">➤</button>' +
    '</div>' +
    '</section>';

  let currentImage = null;

  document.getElementById('ai-image').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentImage = ev.target.result;
      document.getElementById('preview-img').src = currentImage;
      document.getElementById('image-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  const addMessage = (text, isUser) => {
    const chat = document.getElementById('chat-history');
    const div = document.createElement('div');
    div.style.cssText = isUser 
      ? 'align-self:flex-end;background:rgba(0,255,170,0.12);border:1px solid rgba(0,255,170,0.2);border-radius:14px 14px 2px 14px;padding:10px 14px;max-width:85%;font-size:13px;color:#e8f0ec;word-break:break-word;'
      : 'align-self:flex-start;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px 14px 14px 2px;padding:10px 14px;max-width:85%;font-size:13px;color:#e8f0ec;word-break:break-word;white-space:pre-wrap;';
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  };

  const send = async () => {
    const input = document.getElementById('ai-message');
    const btn = document.getElementById('ai-send');
    const text = input.value.trim();
    if (!text && !currentImage) return;

    addMessage(text || t('aiImageSent'), true);
    input.value = '';
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const data = await request('/ai-assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: text || t('aiAskPhoto'),
          imageBase64: currentImage,
          lang: currentLang
        })
      });
      addMessage(data.reply, false);
    } catch (e) {
      addMessage(t('aiError') + e.message, false);
    } finally {
      btn.textContent = '➤';
      btn.disabled = false;
      currentImage = null;
      document.getElementById('image-preview').style.display = 'none';
      document.getElementById('ai-image').value = '';
    }
  };

  document.getElementById('ai-send').onclick = send;
  document.getElementById('ai-message').onkeydown = (e) => {
    if (e.key === 'Enter') send();
  };
}

render();
