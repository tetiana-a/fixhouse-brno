// Тести захисту форм: node --test
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');

process.env.RESEND_API_KEY = 'test';
process.env.EMAIL_TO = 'owner@test.cz';
process.env.TELEGRAM_BOT_TOKEN = 't';
process.env.TELEGRAM_CHAT_ID = '1';

// Підміняємо fetch лише для Resend і Telegram, решту запитів пропускаємо
const realFetch = globalThis.fetch;
let sent = [];
globalThis.fetch = async (url, opts) => {
  if (String(url).startsWith('http://127.0.0.1')) return realFetch(url, opts);
  sent.push({ url: String(url), body: JSON.parse(opts.body) });
  return { ok: true, json: async () => ({}), text: async () => '' };
};

const app = require('../server');
let server, base, ip = 0;
before(() => new Promise(r => { server = app.listen(0, '127.0.0.1', () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());
beforeEach(() => { sent = []; ip++; });

const post = (path, data, from = `10.0.0.${ip}`) => fetch(base + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': from },
  body: JSON.stringify(data)
});
const emails = () => sent.filter(s => s.url.includes('resend')).map(s => s.body);
const telegram = () => sent.filter(s => s.url.includes('telegram')).map(s => s.body.text);

test('HTML z formuláře se escapuje v e-mailu i v Telegramu', async () => {
  const res = await post('/api/contact', { name: 'Test <b>X</b><a href="https://evil.example">Z</a>', phone: '+420 732 995 210' });
  assert.equal(res.status, 200);
  const [owner] = emails();
  assert.deepEqual(owner.to, ['owner@test.cz']);
  assert.ok(owner.html.includes('Test &lt;b&gt;X&lt;/b&gt;&lt;a href=&quot;https://evil.example&quot;&gt;Z&lt;/a&gt;'));
  assert.ok(!owner.html.includes('<a href="https://evil'));
  assert.ok(!telegram()[0].includes('<a href'));
});

test('bez e-mailu klienta se posílá jen jeden e-mail firmě', async () => {
  await post('/api/contact', { name: 'Jan', phone: '732995210' });
  assert.equal(emails().length, 1);
});

test('potvrzení klientovi neobsahuje žádný text z formuláře', async () => {
  const res = await post('/api/contact', { name: 'FINANČNÍ ÚŘAD výzva k úhradě', phone: '732995210', service: 'ZAPLATIT https://evil.example', email: 'klient@test.cz' });
  assert.equal(res.status, 200);
  const confirm = emails().find(e => e.to[0] === 'klient@test.cz');
  assert.ok(confirm);
  assert.ok(!/FINANČNÍ|ZAPLATIT|evil/.test(confirm.html + confirm.subject));
});

test('neplatný telefon, e-mail nebo nestringové hodnoty → 400 a nic se neodešle', async () => {
  for (const data of [
    { name: 'Jan', phone: '<script>' },
    { name: 'Jan', phone: '732995210', email: 'a@b.cz,c@d.cz' },
    { name: 'x'.repeat(101), phone: '732995210' },
    { name: { $gt: '' }, phone: '732995210' }
  ]) {
    const res = await post('/api/contact', data, `10.1.0.${ip++}`);
    assert.equal(res.status, 400, JSON.stringify(data));
  }
  assert.equal(sent.length, 0);
});

test('pole adres místo e-mailu se ignoruje, potvrzení nikam neodejde', async () => {
  await post('/api/contact', { name: 'Jan', phone: '732995210', email: ['a@b.cz', 'c@d.cz'] });
  assert.deepEqual(emails().map(e => e.to[0]), ['owner@test.cz']);
});

test('6. požadavek z jedné IP za 15 minut → 429', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await post('/api/contact', { name: 'Jan', phone: '732995210' })).status, 200);
  const res = await post('/api/contact', { name: 'Jan', phone: '732995210' });
  assert.equal(res.status, 429);
  assert.equal((await post('/api/contact', { name: 'Jan', phone: '732995210' }, '10.9.9.9')).status, 200);
});

test('/api/calculate posílá jen firmě, ne na adresu z formuláře', async () => {
  const res = await post('/api/calculate', { name: 'Jan', phone: '732995210', email: 'klient@test.cz' });
  assert.equal(res.status, 200);
  assert.deepEqual(emails().map(e => e.to[0]), ['owner@test.cz']);
});
