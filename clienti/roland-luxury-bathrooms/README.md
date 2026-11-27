# Sito: Roland Luxury Bathrooms

Sito one-page per un'impresa di ristrutturazione bagni con sede a North London che lavora in
tutta l'Inghilterra. In inglese britannico, statico (HTML, CSS, JS), pensato per Netlify.

## Struttura
- `site/`: il sito da pubblicare (homepage, `privacy/`, `thanks/`, `404.html`)
- `site/video/`: video dell'hero, orizzontale (16:9) e verticale (9:16), in MP4 e WebM
- `foto-originali/`: foto ricevute dal cliente, rinominate (le coppie prima/dopo sono `pair-N-before/after`)
- `docs/servizi.md`: elenco servizi e cose da verificare con il cliente
- `strumenti/`: script che rigenerano immagini ottimizzate (`prep.py`) e video (`reel.py`)

## Pubblicare su Netlify
**Metodo veloce (Netlify Drop)**
1. Vai su app.netlify.com/drop e trascina la cartella `site`.
2. In *Project configuration → Forms* attiva la *form detection*, poi trascina di nuovo `site`
   (i moduli vengono rilevati solo al deploy).
3. In *Project configuration → Notifications → Form submission notifications* aggiungi
   un'email: info@rolandluxurybathrooms.com. Così ogni richiesta arriva in posta.
4. In *Domain management* aggiungi `rolandluxurybathrooms.com` e `www.` e segui le
   istruzioni DNS. L'HTTPS si attiva da solo.

**Metodo collegato al repository**: nuovo progetto da Git, *Base directory*
`clienti/roland-luxury-bathrooms`, nessun build command, publish `site` (già in `netlify.toml`).

Il piano gratuito di Netlify Forms copre 100 richieste al mese.

## Dopo la pubblicazione
- Invia una richiesta di prova dal modulo e verifica che arrivi via email.
- Collega il sito a Google Search Console e al profilo Google Business.

## Rigenerare il video
```bash
python3 -I strumenti/reel.py foto-originali site/video landscape
python3 -I strumenti/reel.py foto-originali site/video portrait
```
Poi ricrea i WebM con ffmpeg (`libvpx-vp9`, crf 38).
