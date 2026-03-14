const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, service } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || 'eddigood2020@gmail.com',
      subject: `🏠 House Fix — Nová poptávka od ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px">
          <h2 style="color:#1A1A1A">🏠 Nová poptávka — House Fix Brno</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold">Jméno:</td><td style="padding:8px">${name}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Telefon:</td><td style="padding:8px"><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Typ práce:</td><td style="padding:8px">${service||'—'}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666;font-size:12px">Odesláno z webu housefixbrno.cz</p>
        </div>
      `
    });
    res.json({ ok: true, message: '✓ Děkujeme! Zavoláme vám do 60 sekund.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: 'Chyba. Zavolejte prosím: +420 732 995 210' });
  }
});

app.post('/api/calculate', async (req, res) => {
  const { name, phone, email, service } = req.body;
  if (!name || !phone) return res.status(400).json({ ok: false, message: 'Vyplňte jméno a telefon' });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || 'eddigood2020@gmail.com',
      subject: `💰 House Fix — Žádost o kalkulaci od ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px">
          <h2 style="color:#1A1A1A">💰 Žádost o kalkulaci — House Fix Brno</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold">Jméno:</td><td style="padding:8px">${name}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Telefon:</td><td style="padding:8px"><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email||'—'}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold">Typ práce:</td><td style="padding:8px">${service||'—'}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666;font-size:12px">Odesláno z webu housefixbrno.cz</p>
        </div>
      `
    });
    res.json({ ok: true, message: '✓ Děkujeme! Zavoláme vám do 60 sekund.' });
  } catch (e) {
    res.status(500).json({ ok: false, message: 'Chyba. Zavolejte prosím: +420 732 995 210' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ House Fix Brno — http://localhost:${PORT}`));
