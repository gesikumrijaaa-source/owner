# Memoria di lavoro: corso + business

Struttura del repository e come usarla.

| Cartella | Contenuto |
|---|---|
| `raw/` | Materiale grezzo del corso così come arriva. Non si modifica. |
| `corso/moduli/` | Una scheda per lezione: tesi, concetti, framework, esempi, azioni. |
| `corso/framework/` | Un file per ogni framework, metodo o formula del corso. |
| `corso/INDEX.md` | Mappa di tutte le lezioni e stato di lavorazione. |
| `corso/glossario.md` | Termini specifici del corso. |
| `corso/sintesi.md` | Il corso intero in poche pagine: il modello mentale. |
| `playbook/` | Guide operative derivate dal corso: strategia, copy, video. |
| `business/profilo.md` | Il mio business: offerta, clienti, posizionamento, tono, obiettivi. |
| `business/decisioni/` | Registro delle decisioni strategiche prese con la base di conoscenza. |
| `business/consulenza-marketing/` | Il questionario di raccolta dati compilato per la consulenza marketing e ads (versione riordinata, in Word e Markdown): la fotografia più completa del business a ottobre 2026. |

## Come entra il materiale

1. Trascrizioni, PDF, slide o sottotitoli vanno in `raw/`, una sottocartella per modulo
   (vedi `raw/README.md` per la convenzione dei nomi).
2. Claude processa ogni lezione in una scheda, estrae i framework, aggiorna indice,
   glossario, sintesi e playbook.
3. Da quel momento, ogni richiesta di strategia, copy o contenuti parte da questi file.

## Stato

- Piattaforma del corso: https://platform.impossibleuniversity.it/library
- Accesso dalle sessioni cloud: **non possibile**. Verificato il 2026-10-02: anche con la
  rete dell'ambiente aperta, il sito risponde con un blocco Cloudflare ("Sorry, you have
  been blocked", errore 1020) a qualsiasi richiesta proveniente dai server cloud, prima
  ancora del login. Non ha senso riprovare dal cloud.
- Strada da usare: una sessione **Local** dell'app desktop di Claude, sul PC dell'utente,
  con il browser dell'utente già autenticato sulla piattaforma. Il materiale esportato
  va poi committato in `raw/` e pushato, così le sessioni cloud possono processarlo.
- Lezioni processate: 0.
