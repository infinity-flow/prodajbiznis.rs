# prodajbiznis.rs

Statički sajt za **Prodaj biznis** (Aleksandar Mitrović) — posredovanje u kupoprodaji biznisa.
Bez build koraka: HTML + CSS + JS, radi direktno na GitHub Pages.

## Stranice
- `index.html` — Početna (istaknuti oglasi, proces, Instagram rilsovi, FAQ)
- `kupi-biznis.html` — svi biznisi na prodaju, filteri i detalji oglasa
- `prodaj-biznis.html` — forma za vlasnike koji prodaju
- `o-nama.html` — o nama / Aleksandar Mitrović
- `kontakt.html` — kontakt i forma za upit

## Šta se menja i gde
Sve u **`assets/js/data.js`**:
- `SITE` — telefon, email, Instagram, `formEndpoint` (npr. Formspree URL)
- `REELS` — linkovi Instagram rilsova (`https://www.instagram.com/reel/XXXX/`)
- `LISTINGS` — oglasi (trenutno 20 primera za demo, zameniti pravim)

Forme: dok je `formEndpoint` prazan, slanje otvara mejl klijent sa popunjenim podacima.
Fotografija za O nama: dodati `assets/img/aleksandar.jpg` i otkomentarisati `<img>` u `o-nama.html`.
