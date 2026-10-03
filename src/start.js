// src\start.js
import './config.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL;

// Baza papkasi mavjud bo'lishini ta'minlaymiz
if (url.startsWith('file:')) {
  const p = url.slice(5);
  if (path.isAbsolute(p)) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); } catch {}
  }
}

// Baza jadvallarini yaratish/yangilash (mavjud ma'lumotlar o'chmaydi)
const cli = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');
try {
  execFileSync(process.execPath, [cli, 'db', 'push'], { cwd: root, stdio: 'inherit', env: process.env });
  console.log('Baza tayyor.');
} catch (e) {
  console.error('DIQQAT: prisma db push xato berdi. Yuqoridagi xato matniga qarang.');
}

await import('./server.js');