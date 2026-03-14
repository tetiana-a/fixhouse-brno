const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, service } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });
  try {
    await transporter.sendMail({
      from: `"House Fix Brno" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'eddigood2020@gmail.com',
      subject: `🏠 Nová poptávka — ${name}`,
      html: `<h2>House Fix Brno — Nová poptávka</h2>
        <p><b>Jméno:</b> ${name}</p>
        <p><b>Telefon:</b> <a href="tel:${phone}">${phone}</a></p>
        <p><b>Typ práce:</b> ${service || '—'}</p>`
    });
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
    await transporter.sendMail({
      from: `"House Fix Brno" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'eddigood2020@gmail.com',
      subject: `💰 Žádost o kalkulaci — ${name}`,
      html: `<h2>House Fix Brno — Žádost o kalkulaci</h2>
        <p><b>Jméno:</b> ${name}</p>
        <p><b>Telefon:</b> <a href="tel:${phone}">${phone}</a></p>
        <p><b>Email:</b> ${email || '—'}</p>`
    });
    res.json({ ok: true, message: '✓ Žádost odeslána! Ozveme se co nejdříve.' });
  } catch (e) {
    console.error('EMAIL ERROR:', e.message);
    res.status(500).json({ ok: false, message: 'Chyba odeslání. Zavolejte: +420 732 995 210' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ House Fix Brno — http://localhost:${PORT}`));
