# 📋 INSTRUKCE — House Fix Brno

## ✅ Krok 1: Spuštění lokálně

```bash
# V terminálu VS Code (Ctrl + ~):
npm install
```

Vytvoř soubor `.env` (zkopíruj z `.env.example`):
```
EMAIL_USER=tvůj_gmail@gmail.com
EMAIL_PASS=app_heslo_z_google
EMAIL_TO=eddigood2020@gmail.com
PORT=3000
```

Jak získat App Password pro Gmail:
1. Jdi na: myaccount.google.com
2. Bezpečnost → Dvoufázové ověření (zapni)
3. Bezpečnost → Hesla aplikací
4. Vyber "Pošta" → vygeneruje 16místný kód
5. Vlož do EMAIL_PASS

Spuštění:
```bash
npm start
# Otevři: http://localhost:3000
```

---

## 🌍 Krok 2: Nasazení na Railway (zdarma, živý web)

1. Jdi na: **railway.app** → Přihlas se (GitHub účet)
2. **New Project** → **Deploy from GitHub repo**
3. Nahraj projekt na GitHub:
   ```bash
   git init
   git add .
   git commit -m "House Fix Brno"
   git remote add origin https://github.com/TVUJ_NICK/fixhouse.git
   git push -u origin main
   ```
4. V Railway klikni na projekt → **Variables** → přidej:
   - `EMAIL_USER` = tvůj gmail
   - `EMAIL_PASS` = app heslo
   - `EMAIL_TO` = eddigood2020@gmail.com
   - `PORT` = 3000
5. Railway automaticky nasadí → dostaneš URL: **xxx.railway.app**

---

## 🔍 Krok 3: SEO — aby Google viděl web

### 3.1 Google Search Console (NUTNÉ)
1. Jdi na: **search.google.com/search-console**
2. Přihlas se Google účtem
3. **Add property** → vlož URL webu (např. housefixbrno.cz nebo xxx.railway.app)
4. Ověř vlastnictví (HTML tag nebo Google Analytics)
5. **Sitemap** → vlož: `https://tvůj-web.cz/sitemap.xml`
6. Klikni **Request indexing** pro hlavní stránku

### 3.2 Google Business Profile (pro lokální SEO Brno)
1. Jdi na: **business.google.com**
2. Vyplň: House Fix Brno, Eduard Korolov, adresa, telefon
3. Ověř telefon/pohlednicí
4. Přidej fotky hotových prací → Google Maps bude zobrazovat firmu!

### 3.3 Co je už hotové v kódu:
- ✅ `<title>` a `<meta description>` na každé stránce
- ✅ Schema.org LocalBusiness (Google vidí: firma, adresa, telefon)
- ✅ `sitemap.xml` — mapa všech stránek pro Google
- ✅ `robots.txt` — povoluje indexování
- ✅ Alt texty na obrázcích
- ✅ Canonical URL (zabraňuje duplicitnímu obsahu)
- ✅ Open Graph (sdílení na sociálních sítích)

### 3.4 Vlastní doména (volitelné)
1. Kup doménu: **housefixbrno.cz** na wedos.cz (~200 Kč/rok)
2. V Railway: Settings → Custom Domain → vlož doménu
3. U registrátora nastav DNS: CNAME → railway URL
4. Certifikát SSL se nastaví automaticky (https://)

---

## 📧 Krok 4: Email funguje?

Test po spuštění:
1. Otevři http://localhost:3000
2. Vyplň formulář (jméno + telefon)
3. Zkontroluj eddigood2020@gmail.com — přijde email

Pokud nepřichází:
- Zkontroluj EMAIL_PASS (musí být App Password, ne normální heslo)
- Zkontroluj že máš zapnuté Dvoufázové ověření na Googlu

---

## 🗂️ Struktura souborů

```
fixhouse-pro/
├── server.js           ← Node.js server (email, API)
├── package.json        ← závislosti
├── .env                ← TAJNÉ ÚDAJE (není v git!)
├── .gitignore
└── public/
    ├── index.html      ← hlavní stránka
    ├── sitemap.xml     ← pro Google
    ├── robots.txt      ← pro Google
    ├── css/
    │   └── main.css
    ├── js/
    │   └── main.js
    └── pages/          ← 6 stránek služeb (nové záložky)
        ├── koupelny.html
        ├── pokoje.html
        ├── kancelare.html
        ├── nove-budovy.html
        ├── kuchyne.html
        └── chaty.html
```

---

## ⚡ Rychlý start (shrnutí)

```bash
1. npm install
2. Vytvoř .env soubor s emaily
3. npm start
4. Otevři http://localhost:3000
5. Nahraj na GitHub → nasaď na Railway
6. Přidej do Google Search Console
7. Vytvoř Google Business Profile
```

**Kontakt webu:**
- Ředitel: Eduard Korolov
- Tel: +420 732 995 210
- Email: eddigood2020@gmail.com
- Adresa: T. Novákové 178/29, 621 00 Brno-Řečkovice
