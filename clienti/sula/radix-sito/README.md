# Sito Radix (brand di Sula Olive Oil)

Sito vetrina statico in inglese. Nessun prezzo: tutto porta a "Request a quote", telefono, WhatsApp o email.

## File
- `index.html`: la pagina principale, tutti i testi sono qui.
- `style.css`: grafica. I colori sono definiti in cima al file (`:root`).
- `main.js`: menu da telefono, latta 3D, foto dell'apertura, video, stima nel modulo.
- `privacy.html`, `thank-you.html`: privacy e pagina dopo l'invio del modulo.
- `assets/`:
  - logo, ulivo, paesaggio e facce della latta 3D (`tin-*.webp`) estratti dall'etichetta (`raw/radix-etichetta-5L.pdf`);
  - foto dell'apertura (`hero-*.webp`, con versione `-m` per telefono) e della fascia, dalle foto del cliente in `raw/foto-cliente/`;
  - foto del frantoio prese dal sito sulaoliveoil.com;
  - `oil-stream.mp4`: secondo video del cliente, rallentato e in loop continuo;
  - `fonts/`: caratteri ospitati sul sito (licenza SIL OFL inclusa), nessuna richiesta a Google.

## Leggerezza
- All'apertura si scaricano meno di 600 KB. Il resto arriva solo quando serve (immagini e video in differita).
- Le animazioni dell'apertura si fermano quando l'apertura esce dallo schermo. I video partono solo quando sono visibili.
- Controllo Lighthouse (telefono): accessibilità, buone pratiche e SEO 100.

## Pubblicare su Netlify a mano
1. Comprimi questa cartella senza `README.md` e `netlify.toml` (oppure usa lo zip già pronto), poi decomprimila.
2. Apri https://app.netlify.com/drop e trascina la cartella `radix-sito` nel riquadro.
3. Rinomina il sito: Site configuration, poi Change site name (es. `radix-oliveoil` diventa radix-oliveoil.netlify.app).
4. Modulo: Site configuration, poi Forms, poi Enable form detection. Poi ricarica la cartella da Deploys
   (trascinandola di nuovo), così Netlify registra il modulo "quote".
5. Notifiche: Forms, poi Form notifications, poi Add notification, poi Email, con l'indirizzo che deve ricevere le richieste.
6. Dominio, quando c'è: Domain management, poi Add a domain.

Per gli aggiornamenti successivi: Deploys, poi trascina di nuovo la cartella aggiornata.

## Da completare prima di andare online
- [ ] Email Radix: sostituire `info@sulaoliveoil.com` in `index.html` (sezione contatti) e in `privacy.html`.
- [ ] NIPT di Sula Olive Oil SHPK in `privacy.html` (cerca `TODO`, ora non compare sulla pagina).
- [ ] Dominio: dopo l'acquisto, aggiungere l'indirizzo completo nel tag `og:image` di `index.html` (`https://dominio/assets/og.jpg`).
- [ ] Profilo Instagram: ora punta a @sula.oliveoil. Cambiarlo se Radix avrà un profilo proprio.
- [ ] Foto vere della latta e delle bottiglie Radix, quando esistono (ora si usa la latta 3D costruita dall'etichetta).
- [ ] Dopo l'acquisto del dominio: aggiungere `sitemap.xml` e `<link rel="canonical">`.
