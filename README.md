# jcute_snip Telegram Mini App

Online navbatli barber bot: xizmat tanlash, 30 daqiqalik vaqtlar, 18:00 ovqatlanish qoidasi, kabinet, statistikalar va admin boshqaruvi.

## 1. Talablar

- Node.js 20+ (baza alohida o‘rnatilmaydi — SQLite fayl sifatida avtomatik yaratiladi)
- BotFather bot tokeni

## 2. O‘rnatish

```powershell
./start-local.ps1
```

`.env` ichida `BOT_TOKEN` va `WEBAPP_URL` qiymatlarini yozing. `ADMIN_TELEGRAM_ID` sizniki sifatida oldindan kiritilgan. Database fayli avtomatik yaratiladi.

`start-local.ps1` server va botni avtomatik ishga tushiradi.

## 3. Telegram sozlash

1. BotFather’da `/newbot` orqali bot yarating va tokenni `.env`ga yozing.
2. Lokal testda `ngrok http 3000` ishlating va chiqqan `https://...` URLni `WEBAPP_URL`ga qo‘ying.
3. BotFather → `/setmenubutton` → botni tanlang → `Web App` URL sifatida shu HTTPS URLni qo‘ying.
4. Production uchun Render/Railway/VPS’ga deploy qiling va `WEBAPP_URL`ni production URLga almashtiring.

## 4. GitHub

```powershell
git init
git add .
git commit -m "jcute_snip online booking bot"
git branch -M main
git remote add origin https://github.com/USERNAME/jcute-snip-bot.git
git push -u origin main
```

## Eslatma

Broadcast xabarlari Telegram chekloviga rioya qilgan holda ketma-ket yuboriladi. Productionda avtomatik zaxira nusxa va monitoring qo‘shish tavsiya qilinadi.
