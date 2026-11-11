// Ukázkový (výukový) projekt: server pouze zobrazuje statické stránky.
// Příjem poptávek (/api/contact, /api/calculate), e-maily a Telegram byly odstraněny 12. 11. 2026.
const express = require('express');

const app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ House Fix Brno (demo) — http://localhost:${PORT}`));
