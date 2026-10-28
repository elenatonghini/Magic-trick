# Pubblicare SIX su GitHub, Netlify e Vercel

SIX è un’applicazione statica. Non usa database, server applicativi, autenticazione, API a pagamento, analytics o servizi esterni a runtime. Nessuna chiave o credenziale è necessaria. Lo stato della partita resta in memoria e si azzera ricaricando la pagina. Non esiste un database da rimuovere o migrare.

Il download dei pacchetti durante `npm ci` richiede una connessione, così come il caricamento iniziale del sito. Dopo il caricamento degli asset, il gioco e le sezioni didattiche non richiedono API. Non è una PWA: aprire o ricaricare il sito completamente offline non è garantito.

## Controllo locale

Node 22 è indicato in `.nvmrc` e usato nei workflow. Il minimo dichiarato è Node 22.12.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
E2E_PRODUCTION=1 npm run test:e2e
```

Il comando di pubblicazione è **`npm run build`** e la cartella da pubblicare è **`dist`**. Per Netlify e Vercel il sito usa la radice `/`: lascia `BASE_PATH` non impostato oppure impostalo a `/`. Non usare `/Magic_Trick/`, riservato a GitHub Pages.

## GitHub

La cartella locale non era ancora un repository Git al controllo finale. Crea un repository su GitHub e carica il sorgente, includendo `package-lock.json`, `netlify.toml`, `vercel.json`, `.nvmrc` e `.github/workflows/`.

Non caricare `node_modules`, `dist`, `.env`, `.netlify`, `.vercel` o i risultati locali dei test: sono già esclusi da `.gitignore`. L’app non richiede un file `.env`.

Il workflow **Verify SIX** esegue installazione, test matematici, build e percorsi browser sulla build di produzione quando arriva un push su `main` o una pull request. L’esecuzione effettiva su GitHub resta da confermare dopo il caricamento.

## Netlify

1. Importa il repository GitHub come nuovo sito.
2. La configurazione `netlify.toml` imposta Node 22, `npm run build`, la cartella `dist` e `BASE_PATH=/`.
3. Non configurare database, funzioni, chiavi API o integrazioni backend: questo progetto non ne usa.
4. Puoi anche caricare manualmente la cartella `dist`, generata con una build alla radice `/`.

Riferimento: [Vite su Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/).

## Vercel

1. Importa lo stesso repository GitHub in un nuovo progetto.
2. `vercel.json` indica Vite, `npm ci`, `npm run build` e `dist`.
3. Nelle impostazioni del progetto scegli Node 22.x. Lascia `BASE_PATH` assente oppure usa `/`.
4. Non aggiungere storage, database o variabili segrete.

Riferimento: [Configurazione vercel.json](https://vercel.com/docs/project-configuration/vercel-json).

Le due piattaforme possono leggere lo stesso repository: non è necessario trasferire il sito da Netlify a Vercel. Nessun deploy è stato eseguito da questa verifica.

## GitHub Pages — facoltativo

Il workflow **Deploy SIX** si avvia manualmente dalla scheda Actions. Non parte automaticamente al primo push: in questo modo importare il progetto su Netlify o Vercel non richiede di attivare anche GitHub Pages.

Per usarlo, abilita GitHub Pages con origine GitHub Actions e avvia il workflow. Il prefisso del repository è gestito da quella build. Per verificarlo localmente:

```sh
BASE_PATH=/Magic_Trick/ npm run build
BASE_PATH=/Magic_Trick/ E2E_PRODUCTION=1 npm run test:e2e
```

Se dopo vuoi caricare `dist` su Netlify, ricreala alla radice:

```sh
BASE_PATH=/ npm run build
```

L’interfaccia usa stato React, non URL di percorso: non richiede regole di riscrittura SPA.

## Dopo la prima pubblicazione

Apri l’URL HTTPS da un altro dispositivo e controlla introduzione, sei risposte, rivelazione, correzione, spiegazione e laboratorio. Verifica la ricarica della pagina e l’assenza di errori nella console. I test locali non confermano la configurazione di un account hosting o del dominio.

La sezione curriculum resta intenzionalmente fuori da questa fase.
