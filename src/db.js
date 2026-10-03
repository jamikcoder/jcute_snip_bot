// src\db.js
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:' + path.join(root, 'prisma', 'jcute_snip.db').replace(/\\/g, '/');
}
if (!process.env.ADMIN_TELEGRAM_ID) {
  process.env.ADMIN_TELEGRAM_ID = '719139730';
}

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});