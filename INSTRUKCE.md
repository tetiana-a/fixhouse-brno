# 📋 INSTRUKCE — House Fix Brno (ukázkový projekt)

House Fix Brno je **fiktivní stavební firma** — výukový a portfoliový projekt webdesignu Tetiany Kotolup.
Web neslouží k nabídce ani prodeji služeb. Podrobnosti a historie úprav: [DEMO.md](DEMO.md).

## Spuštění lokálně

```bash
npm install
npm start
# Otevři: http://localhost:3000
```

Server pouze zobrazuje statické stránky ze složky `public/`. Nepotřebuje žádné proměnné prostředí (kromě volitelného `PORT`).

## Nasazení (Railway)

1. **New Project** → **Deploy from GitHub repo** → tento repozitář
2. Railway spustí `npm start` automaticky

Stránky mají `<meta name="robots" content="noindex, nofollow">` — vyhledávače je nemají indexovat.
Pro ukázkový projekt nezakládej Google Business Profile ani jiné firemní profily.
