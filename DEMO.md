# Ukázkový (výukový) projekt — House Fix Brno

House Fix Brno je **fiktivní stavební firma** — výukový a portfoliový projekt webdesignu Tetiany Kotolup.
Firma neexistuje, nemá zaměstnance, zakázky ani recenze a žádné služby neposkytuje. Ceny a texty na webu jsou pouze ilustrativní.

## Historie úprav

### 12. 11. 2026 — zřetelné označení jako ukázkový projekt

Stav před úpravou: commit `ee4b583` (15. 3. 2026), zůstává v historii repozitáře.
Snímky obrazovky před úpravou a po ní archivuje autorka mimo repozitář (obsahují odstraněné údaje, proto se znovu nezveřejňují).

- Na každé stránce je nahoře trvalý pruh „UKÁZKOVÝ WEB — fiktivní firma…“ a stejné upozornění v patičce.
- Vypnuty všechny poptávkové formuláře, kalkulačka ceny a tlačítka „Zavolat“; server nepřijímá poptávky (odstraněny `/api/contact`, `/api/calculate`, e-maily a Telegram).
- Odstraněny smyšlené recenze, hodnocení „4.9★“, počty realizací a specialistů, „od roku 2007 / 2022“, „17 let zkušeností“, údaje o pojištění, „Pracujeme legálně…“, smyšlené IČ a portfolio realizací.
- Odstraněny jméno, telefon, e-mail a adresa Eduarda Korolova, telefon +420 608 317 700, e-mail info@housefixbrno.cz a adresy.
- Odstraněna strukturovaná data Schema.org `LocalBusiness`; vyhledávačům zakázána indexace (`noindex, nofollow`).
- Stránky „O nás“, „Portfolio“ a „Kontakt“ nyní popisují projekt jako ukázkový.
