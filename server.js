// Simple guestbook server with local JSON persistence
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5173;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'guestbook.json');

app.use(express.json({ limit: '256kb' }));

// Serve static files for same-origin frontend
app.use(express.static(__dirname));

async function ensureDataFile() {
  try { await fsp.mkdir(DATA_DIR, { recursive: true }); } catch (_) {}
  try { await fsp.access(DATA_FILE, fs.constants.F_OK); }
  catch (_) { await fsp.writeFile(DATA_FILE, '[]', 'utf8'); }
}

async function readAll() {
  await ensureDataFile();
  const raw = await fsp.readFile(DATA_FILE, 'utf8');
  try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : []; }
  catch (_) { return []; }
}

async function writeAll(items) {
  const tmp = DATA_FILE + '.tmp';
  await fsp.writeFile(tmp, JSON.stringify(items, null, 2), 'utf8');
  await fsp.rename(tmp, DATA_FILE);
}

app.get('/api/guestbook', async (req, res) => {
  try {
    const items = await readAll();
    items.sort((a, b) => a.createdAt - b.createdAt);
    res.json(items);
  } catch (e) { res.status(500).json({ error: 'read_failed' }); }
});

app.post('/api/guestbook', async (req, res) => {
  try {
    const text = String((req.body && req.body.text) || '').trim();
    const name = String((req.body && req.body.name) || '').trim();
    if (!text) return res.status(400).json({ error: 'empty_text' });
    if (text.length > 600) return res.status(400).json({ error: 'too_long' });
    const now = Date.now();
    const id = now + '-' + Math.random().toString(36).slice(2, 8);
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    const ua = (req.headers['user-agent'] || '').toString();
    const entry = { id, text, name, createdAt: now, ip, ua };
    const items = await readAll();
    items.push(entry);
    await writeAll(items);
    res.json(entry);
  } catch (e) { res.status(500).json({ error: 'write_failed' }); }
});

app.listen(PORT, () => {
  console.log(`[guestbook] listening on http://localhost:${PORT}`);
});


