const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

async function sendEmail(subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'House Fix Brno <onboarding@resend.dev>',
      to: [process.env.EMAIL_TO || 'eddigood2020@gmail.com'],
      subject,
      html
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

app.post('/api/contact', async (req, res) => {
  const { name, phone, service } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });
  try {
    await sendEmail(
      `🏠 Nová poptávka — ${name}`,
      `<h2>House Fix Brno — Nová poptávka</h2>
       <p><b>Jméno:</b> ${name}</p>
       <p><b>Telefon:</b> <a href="tel:${phone}">${phone}</a></p>
       <p><b>Typ práce:</b> ${service || '—'}</p>`
    );
    res.json({ ok: true, message: '✓ Poptávka odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('EMAIL ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

app.post('/api/calculate', async (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });
  try {
    await sendEmail(
      `💰 Žádost o kalkulaci — ${name}`,
      `<h2>House Fix Brno — Žádost o kalkulaci</h2>
       <p><b>Jméno:</b> ${name}</p>
       <p><b>Telefon:</b> <a href="tel:${phone}">${phone}</a></p>
       <p><b>Email:</b> ${email || '—'}</p>`
    );
    res.json({ ok: true, message: '✓ Žádost odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('EMAIL ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ House Fix Brno — http://localhost:${PORT}`));