#!/usr/bin/env node
/**
 * Refresh public/telegram-cache/*.json while you have access to t.me (VPN / foreign VPS).
 * Usage: node server/refresh-telegram-cache.mjs [channel] [id...]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchTelegramPostLive } from './telegram-lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../public/telegram-cache');

const channel = process.argv[2] || 'timant32info';
const ids = process.argv.slice(3).length ? process.argv.slice(3) : ['4', '7'];

await mkdir(OUT, { recursive: true });

for (const id of ids) {
  process.stdout.write(`fetch ${channel}/${id}... `);
  try {
    const post = await fetchTelegramPostLive(channel, id);
    const file = path.join(OUT, `${channel}-${id}.json`);
    await writeFile(file, `${JSON.stringify(post, null, 2)}\n`);
    console.log(`ok → ${file}`);
  } catch (error) {
    console.log(`FAIL (${error.message})`);
    process.exitCode = 1;
  }
}
