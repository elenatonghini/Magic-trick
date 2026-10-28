# Capire e presentare SIX

Questa è una guida tecnica, non una riflessione personale già scritta. La versione iniziale e questi miglioramenti sono stati realizzati con assistenza AI: non presentarli come codice scritto autonomamente.

## La matematica da saper spiegare

Il computer può scrivere un numero con sole due cifre: 0 e 1. Ogni posizione vale una potenza di due. In sei posizioni, da sinistra a destra, i pesi sono 32, 16, 8, 4, 2, 1.

42 = 32 + 8 + 2. Quindi 42 in binario è 101010: accendo 32, spengo 16, accendo 8, spengo 4, accendo 2, spengo 1.

Una carta contiene tutti e soli i numeri che hanno 1 nella sua posizione. Se rispondi Sì, il programma aggiunge quel peso. Non deve conoscere il numero in anticipo.

Sei risposte binarie producono 2⁶ = 64 schemi diversi. Cinque ne producono solo 32: non bastano a distinguere 63 scelte. Togliendo lo schema tutto zero, restano i numeri da 1 a 63.

Perché non ci sono ambiguità? Il più grande peso sul quale due schemi differiscono vale più della somma di tutti quelli più piccoli. La differenza non può essere annullata: le somme sono diverse.

Un errore di lettura normalmente produce un altro numero valido. Il programma non può accorgersene. Solo tutte risposte No producono 0, fuori dall’intervallo del gioco.

## Dove leggere il codice

1. `src/math.ts`: parti da `generateCards`. L’operatore `&` conserva i bit accesi in entrambi gli operandi. `(n & weight) !== 0` controlla quindi la presenza di quel peso.
2. `inferNumber`: legge oggetti `{ weight, yes }` e somma i pesi selezionati. Conservare il peso nell’oggetto evita errori quando cambia l’ordine di visualizzazione.
3. `src/App.tsx`: segui `begin`, `answer`, `back`, poi le schermate. `lock.current` blocca subito il secondo clic; lo stato React da solo non si aggiorna sincronicamente durante lo stesso evento.
4. `src/Explanation.tsx`: lo stesso numero guida interruttori, cifre, somma, tabella e carte. Non ci sono copie indipendenti da sincronizzare.
5. `src/CardFan.tsx` e `src/Stage3D.tsx`: sono decorativi. Il gioco rimane HTML accessibile. Il 3D richiede nuovi fotogrammi solo durante un breve ingresso.

## Come controllare il tuo lavoro

```sh
npm test
npm run test:e2e
npm run build
```

I test matematici verificano tutti i valori supportati, non solo qualche esempio. I test browser verificano il percorso reale, comprese correzioni, tastiera e fallback. Il controllo automatico di accessibilità non sostituisce la prova con uno screen reader.

Per una vera contribuzione personale, scegli uno dei tre compiti in STUDENT_TASKS.md, implementalo, controllalo e racconta nel diario ciò che è successo davvero. Prima di mostrare il progetto, prova a spiegare 42, il limite delle cinque domande e la protezione contro i clic ripetuti senza aprire questa guida.

La motivazione di base fornita è un interesse generale e duraturo per la magia. Restano da documentare contributi personali verificabili e osservazioni di utenti reali. Non sono dettagli che l’AI possa inventare al tuo posto. PORTFOLIO_GUIDE.md contiene una scaletta per la dimostrazione e le domande tecniche da preparare.
