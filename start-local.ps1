$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js topilmadi. Avval https://nodejs.org dan LTS versiyani o‘rnating." -ForegroundColor Red
  exit 1
}
if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host ".env fayli yaratildi." -ForegroundColor Yellow
  Write-Host "1) .env ni oching, yangi BotFather tokeningizni BOT_TOKEN qatoriga yozing."
  Write-Host "2) WEBAPP_URL ni ngrok URL bilan almashtiring."
  Write-Host "3) So‘ng ushbu faylni yana ishga tushiring."
  Start-Process notepad.exe '.env'
  exit 0
}
npm install
npm run db:generate
npm run db:migrate
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PSScriptRoot'; npm run bot"
npm run dev
