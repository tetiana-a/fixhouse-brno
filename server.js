const express = require('express');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1); // за проксі Railway: req.ip = справжній IP клієнта
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// ── Resend email ──
async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'House Fix Brno <info@housefixbrno.cz>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Telegram ──
async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

// ── Захист форм ──
// Усе, що прийшло з форми, екрануємо перед вставкою в HTML листа і Telegram
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const str = v => (typeof v === 'string' ? v.trim() : '');

const PHONE_RE = /^\+?[\d\s()-]{6,20}$/;
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

// Повертає очищені поля або { error }
function readForm(body = {}) {
  const f = { name: str(body.name), phone: str(body.phone), service: str(body.service), email: str(body.email) };
  if (!f.name || !f.phone) return { error: 'Vyplňte jméno a telefon' };
  if (f.name.length > 100 || f.service.length > 100) return { error: 'Příliš dlouhý text' };
  if (!PHONE_RE.test(f.phone)) return { error: 'Zadejte platné telefonní číslo' };
  if (f.email && (f.email.length > 200 || !EMAIL_RE.test(f.email))) return { error: 'Zadejte platný e-mail' };
  return f;
}

// Не більше 5 заявок з одного IP за 15 хвилин
// shortcut: ліміт у памʼяті процесу, скидається при рестарті; для кількох інстансів — Redis або express-rate-limit зі store
const WINDOW_MS = 15 * 60 * 1000, MAX_HITS = 5, hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  if (hits.size > 10000) hits.clear();
  const recent = (hits.get(req.ip) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return res.status(429).json({ ok: false, message: 'Příliš mnoho požadavků. Zkuste to později nebo zavolejte: +420 732 995 210' });
  }
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

// ── /api/contact ──
app.post('/api/contact', rateLimit, async (req, res) => {
  const f = readForm(req.body);
  if (f.error) return res.status(400).json({ ok: false, message: f.error });
  const name = esc(f.name), phone = esc(f.phone), service = esc(f.service || '—');

  try {
    await Promise.all([

      // 1. Email компанії
      sendEmail(
        process.env.EMAIL_TO || 'eddigood2020@gmail.com',
        `🏠 Nová poptávka — ${f.name}`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1A1A1A;margin-bottom:20px">🏠 House Fix Brno — Nová poptávka</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;font-weight:bold;color:#666;width:120px">Jméno:</td><td style="padding:10px 0;font-size:16px"><b>${name}</b></td></tr>
            <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold;color:#666">Telefon:</td><td style="padding:10px;font-size:16px"><a href="tel:${phone}" style="color:#F5C800;font-weight:bold">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:bold;color:#666">Typ práce:</td><td style="padding:10px 0">${service}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold;color:#666">Email:</td><td style="padding:10px">${esc(f.email || '—')}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#F5C800;border-radius:6px;text-align:center">
            <a href="tel:${phone}" style="color:#000;font-weight:bold;font-size:18px;text-decoration:none">📞 Zavolat: ${phone}</a>
          </div>
          <p style="margin-top:16px;color:#999;font-size:12px">Odesláno z webu housefixbrno.cz</p>
        </div>`
      ),

      // 2. Telegram
      sendTelegram(
        `🏠 <b>NOVÁ POPTÁVKA</b>\n\n👤 <b>Jméno:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n🔧 <b>Typ práce:</b> ${service}\n\n🌐 housefixbrno.cz`
      )
    ]);
  } catch (e) {
    console.error('ERROR:', e.message);
    return res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }

  // 3. Підтвердження клієнту — лише якщо він дав email, і без жодного тексту з форми,
  // щоб форму не можна було використати для розсилки чужих повідомлень від імені фірми
  if (f.email) {
    await sendEmail(
      f.email,
      '✓ Vaše poptávka byla přijata — House Fix Brno',
      `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:#1A1A1A">Dobrý den!</h2>
        <p style="color:#444;line-height:1.7;margin:16px 0">Děkujeme za vaši poptávku. Přijali jsme váš požadavek a co nejdříve vás kontaktujeme.</p>
        <p style="color:#444;line-height:1.7">V případě dotazů nás kontaktujte:</p>
        <p><a href="tel:+420732995210" style="color:#F5C800;font-weight:bold;font-size:16px">📞 +420 732 995 210</a></p>
        <p><a href="mailto:eddigood2020@gmail.com" style="color:#666">eddigood2020@gmail.com</a></p>
        <hr style="border:1px solid #eee;margin:20px 0">
        <p style="color:#999;font-size:12px">House Fix Brno — T. Novákové 178/29, 621 00 Brno-Řečkovice</p>
      </div>`
    ).catch(e => console.error('CONFIRM ERROR:', e.message)); // заявка вже дійшла, помилку підтвердження лише логуємо
  }

  res.json({ ok: true, message: '✓ Poptávka odeslána! Ozveme se co nejdříve.' });
});

// ── /api/calculate ──
app.post('/api/calculate', rateLimit, async (req, res) => {
  const f = readForm(req.body);
  if (f.error) return res.status(400).json({ ok: false, message: f.error });
  const name = esc(f.name), phone = esc(f.phone), email = esc(f.email || '—');

  try {
    await Promise.all([

      // 1. Email kompanії
      sendEmail(
        process.env.EMAIL_TO || 'eddigood2020@gmail.com',
        `💰 Žádost o kalkulaci — ${f.name}`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1A1A1A;margin-bottom:20px">💰 House Fix Brno — Žádost o kalkulaci</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;font-weight:bold;color:#666;width:120px">Jméno:</td><td style="padding:10px 0;font-size:16px"><b>${name}</b></td></tr>
            <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold;color:#666">Telefon:</td><td style="padding:10px;font-size:16px"><a href="tel:${phone}" style="color:#F5C800;font-weight:bold">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:bold;color:#666">Email:</td><td style="padding:10px 0">${email}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#F5C800;border-radius:6px;text-align:center">
            <a href="tel:${phone}" style="color:#000;font-weight:bold;font-size:18px;text-decoration:none">📞 Zavolat: ${phone}</a>
          </div>
        </div>`
      ),

      // 2. Telegram
      sendTelegram(
        `💰 <b>ŽÁDOST O KALKULACI</b>\n\n👤 <b>Jméno:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n✉️ <b>Email:</b> ${email}\n\n🌐 housefixbrno.cz`
      )
    ]);

    res.json({ ok: true, message: '✓ Žádost odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ House Fix Brno — http://localhost:${PORT}`));
}

module.exports = app;
