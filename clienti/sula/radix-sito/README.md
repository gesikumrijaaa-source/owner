# Sito Radix (brand di Sula Olive Oil)

Sito vetrina statico in inglese. Nessun prezzo: tutto porta a "Request a quote", telefono, WhatsApp o email.

## File
- `index.html`: la pagina principale, tutti i testi sono qui.
- `style.css`: grafica. I colori sono definiti in cima al file (`:root`).
- `main.js`: menu da telefono, piccole animazioni.
- `privacy.html`, `thank-you.html`: privacy e pagina dopo l'invio del modulo.
- `assets/`: logo, ulivo, rametto, paesaggio e le 4 facce della latta 3D (`tin-*.webp`) estratti dall'etichetta (`raw/radix-etichetta-5L.pdf`),
  foto del frantoio prese dal sito sulaoliveoil.com.

## Pubblicare su Netlify (circa 5 minuti)
1. Accedi a https://app.netlify.com e scegli "Add new site", poi "Deploy manually".
2. Trascina la cartella `radix-sito` nella pagina.
3. In "Site configuration", poi "Forms", attiva il rilevamento dei moduli e ripubblica: il modulo "quote" compare da solo.
4. In "Forms", poi "Form notifications", aggiungi una notifica email verso l'indirizzo che deve ricevere le richieste.
5. Quando il dominio è comprato: "Domain management", poi "Add a domain".

In alternativa si collega il repository GitHub a Netlify, con cartella di pubblicazione `clienti/sula/radix-sito`.

## Da completare prima di andare online
- [ ] Email Radix: sostituire `info@sulaoliveoil.com` in `index.html` (sezione contatti) e in `privacy.html`.
- [ ] NIPT di Sula Olive Oil SHPK in `privacy.html` (cerca `TODO`).
- [ ] Dominio: dopo l'acquisto, aggiungere l'indirizzo completo nel tag `og:image` di `index.html` (`https://dominio/assets/og.jpg`).
- [ ] Profilo Instagram: ora punta a @sula.oliveoil. Cambiarlo se Radix avrà un profilo proprio.
- [ ] Foto vere della latta e delle bottiglie Radix, quando esistono (ora si usa l'etichetta).
