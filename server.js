const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
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

// ── /api/contact ──
app.post('/api/contact', async (req, res) => {
  const { name, phone, service } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });

  try {
    await Promise.all([

      // 1. Email компанії
      sendEmail(
        process.env.EMAIL_TO || 'eddigood2020@gmail.com',
        `🏠 Nová poptávka — ${name}`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1A1A1A;margin-bottom:20px">🏠 House Fix Brno — Nová poptávka</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;font-weight:bold;color:#666;width:120px">Jméno:</td><td style="padding:10px 0;font-size:16px"><b>${name}</b></td></tr>
            <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold;color:#666">Telefon:</td><td style="padding:10px;font-size:16px"><a href="tel:${phone}" style="color:#F5C800;font-weight:bold">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:bold;color:#666">Typ práce:</td><td style="padding:10px 0">${service || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#F5C800;border-radius:6px;text-align:center">
            <a href="tel:${phone}" style="color:#000;font-weight:bold;font-size:18px;text-decoration:none">📞 Zavolat: ${phone}</a>
          </div>
          <p style="margin-top:16px;color:#999;font-size:12px">Odesláno z webu housefixbrno.cz</p>
        </div>`
      ),

      // 2. Email клієнту (підтвердження)
      sendEmail(
        // якщо клієнт дав email — надіслати і йому
        req.body.email || process.env.EMAIL_TO,
        '✓ Vaše poptávka byla přijata — House Fix Brno',
        `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1A1A1A">Dobrý den, ${name}!</h2>
          <p style="color:#444;line-height:1.7;margin:16px 0">Děkujeme za vaši poptávku. Přijali jsme váš požadavek a co nejdříve vás kontaktujeme.</p>
          <div style="padding:16px;background:#f9f9f9;border-radius:6px;margin:20px 0">
            <p style="margin:0;color:#666"><b>Vaše poptávka:</b> ${service || 'Rekonstrukce'}</p>
            <p style="margin:8px 0 0;color:#666"><b>Telefon:</b> ${phone}</p>
          </div>
          <p style="color:#444;line-height:1.7">V případě dotazů nás kontaktujte:</p>
          <p><a href="tel:+420732995210" style="color:#F5C800;font-weight:bold;font-size:16px">📞 +420 732 995 210</a></p>
          <p><a href="mailto:eddigood2020@gmail.com" style="color:#666">eddigood2020@gmail.com</a></p>
          <hr style="border:1px solid #eee;margin:20px 0">
          <p style="color:#999;font-size:12px">House Fix Brno — T. Novákové 178/29, 621 00 Brno-Řečkovice</p>
        </div>`
      ),

      // 3. Telegram
      sendTelegram(
        `🏠 <b>NOVÁ POPTÁVKA</b>\n\n👤 <b>Jméno:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n🔧 <b>Typ práce:</b> ${service || '—'}\n\n🌐 housefixbrno.cz`
      )
    ]);

    res.json({ ok: true, message: '✓ Poptávka odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

// ── /api/calculate ──
app.post('/api/calculate', async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });

  try {
    await Promise.all([

      // 1. Email kompanії
      sendEmail(
        process.env.EMAIL_TO || 'eddigood2020@gmail.com',
        `💰 Žádost o kalkulaci — ${name}`,
        `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#1A1A1A;margin-bottom:20px">💰 House Fix Brno — Žádost o kalkulaci</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;font-weight:bold;color:#666;width:120px">Jméno:</td><td style="padding:10px 0;font-size:16px"><b>${name}</b></td></tr>
            <tr style="background:#f9f9f9"><td style="padding:10px;font-weight:bold;color:#666">Telefon:</td><td style="padding:10px;font-size:16px"><a href="tel:${phone}" style="color:#F5C800;font-weight:bold">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;font-weight:bold;color:#666">Email:</td><td style="padding:10px 0">${email || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#F5C800;border-radius:6px;text-align:center">
            <a href="tel:${phone}" style="color:#000;font-weight:bold;font-size:18px;text-decoration:none">📞 Zavolat: ${phone}</a>
          </div>
        </div>`
      ),

      // 2. Telegram
      sendTelegram(
        `💰 <b>ŽÁDOST O KALKULACI</b>\n\n👤 <b>Jméno:</b> ${name}\n📞 <b>Telefon:</b> ${phone}\n✉️ <b>Email:</b> ${email || '—'}\n\n🌐 housefixbrno.cz`
      )
    ]);

    res.json({ ok: true, message: '✓ Žádost odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ House Fix Brno — http://localhost:${PORT}`));
