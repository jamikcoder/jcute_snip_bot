import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:' + path.join(root, 'prisma', 'jcute_snip.db').replace(/\\/g, '/');
  console.warn('DATABASE_URL topilmadi, standart baza ishlatilmoqda:', process.env.DATABASE_URL);
}
if (!process.env.ADMIN_TELEGRAM_ID) {
  process.env.ADMIN_TELEGRAM_ID = '719139730';
}

const url = process.env.DATABASE_URL;
if (url.startsWith('file:')) {
  const p = url.slice(5);
  if (path.isAbsolute(p)) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); } catch {}
  }
}

const cli = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');
try {
  execFileSync(process.execPath, [cli, 'db', 'push', '--skip-generate'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  });
  console.log('Baza tayyor.');
} catch (e) {
  console.error('DIQQAT: prisma db push xato berdi. Yuqoridagi xato matniga qarang.');
}

await import('./server.js');