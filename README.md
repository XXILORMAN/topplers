# Sito di Topplers

Pagina unica, statica, senza build: HTML + CSS + JavaScript, con GSAP/ScrollTrigger e Matter.js salvati in `vendor/`.
Si apre anche con doppio clic su `index.html`. Pensato prima per il telefono, poi per lo schermo grande.

## Cosa fa
- **Cielo vivo**: tela fissa che cambia mondo scorrendo (Pianure, Ghiaccio, Lava, Orbite, Alba). Il sole del hero (o il bottone in barra) cambia l'ora.
- **Torre laterale** (dove c'e' spazio a lato del contenuto, da circa 1370 px in su): sempre con la skin base (Mattoncini). Una sezione = un pezzo che cade; torna su e il pezzo sparisce. Oscilla con lo scroll e crolla (per gioco) se si scorre molto forte. Sui telefoni e sugli schermi stretti resta la barra a blocchi in alto.
- **I mondi a scorrimento laterale** (sezione "Mondi"): la pagina si ferma e, scorrendo, i pannelli scivolano di lato (intro, Pianure, Ghiaccio, Lava) con sfondo a parallasse, titolo gigante a contorno, telefono che ruota, testi che entrano uno a uno e il cielo che cambia mondo. Si aggancia al pannello piu' vicino; in basso una barra e tre tasti per saltare. Sul telefono lo stesso, con le meccaniche come etichette. Con movimento ridotto i pannelli restano uno sotto l'altro.
- **Nastri** colorati inclinati tra le sezioni: scorrono da soli e seguono lo scroll (piu' veloci, o al contrario, secondo la velocita').
- **Anteprima della torre** (sezione "Prova la torre"): una torre fatta su cui si cambiano le **14 skin dei pezzi**, i **7 basamenti** e i **4 pet**. Pochi gesti: un tocco e la torre si trasforma (i pezzi si girano uno a uno, il basamento scivola, il pet rimbalza dentro). Se nessuno tocca, da sola passa in rassegna le skin. Tre schede (Skin / Basamento / Pet).
- **Testi che si accendono parola per parola**, potenziamenti che si aprono a ventaglio, carte che si inclinano con la velocita' dello scroll, tasti magnetici, un pezzo che sale lungo la roadmap accendendo le tappe.
- **Fisica ambientale**: le lettere del marchio e le pile di pezzi (apertura e chiusura) si afferrano e si lanciano. Un tocco su uno spazio vuoto fa cadere un pezzo.
- **Costruzione libera**: un altimetro da trascinare, con le tappe 25 / 50 / 60 m (titolo, titolo piu' raro, skin Nuvole). Parte da solo la prima volta.
- **Stretch goal** con simulatore a cursore, ricompense, roadmap, stato dei lavori, team.
- **Newsletter + conto alla rovescia** (placeholder, vedi sotto).
- IT/EN. Con `prefers-reduced-motion` resta tutto fermo e leggibile.

## Da compilare in `data/config.js`
| Valore | Effetto |
|---|---|
| `KICKSTARTER_URL` | Finche' e' vuoto i tasti Kickstarter sono spenti ("in arrivo"). |
| `DATA_LANCIO` | Data ISO (`"2026-11-05T16:00:00+01:00"`). Se `null` il conto alla rovescia mostra "data in arrivo". |
| `FORM_ENDPOINT` | Indirizzo che riceve `{"email","lang"}` in POST JSON (Formspree, Buttondown...). Se vuoto il modulo conferma ma non invia ne' salva niente. |

## La demo giocabile
Per ora **non e' nel sito**: la prima versione non entrava bene nello schermo e non girava come doveva.
Il codice e' in `demo-futura/` (`demo.js`, `demo.css`, `demo.html`) con le istruzioni per rimetterla quando sara' pronta.

## Pubblicare su GitHub Pages
1. Copia il **contenuto** di questa cartella nella radice della repo (deve esserci `index.html` in radice). `demo-futura/` e `strumenti/` si possono lasciare fuori.
2. Settings > Pages > Deploy from a branch > `main` / root.
3. I percorsi sono tutti relativi: funziona anche in una sotto-cartella.

## Testi
Tutti in `data/testi.js` (sezioni `en` e `it`; in fondo le stringhe aggiunte dopo la bozza). Per cambiare un testo basta modificare la chiave.

## Asset
`assets/` e' una copia dei file ricavati dal gioco. Le 14 skin dei pezzi: le prime otto vengono da `../sito/strumenti/prepara_asset.py`, le altre sei da `strumenti/aggiungi_skin.py` (Pillow; leggono `unity/Assets/_Project/Art/Resources/Skins`). Per aggiungerne altre basta un foglio con i sette pezzi uno sotto l'altro e una riga in quello script, piu' il nome in `T.SKINS` (`js/util.js`) e le stringhe `skn_*`.

## Come e' fatto (se serve toccarlo)
| File | Cosa |
|---|---|
| `js/cielo.js` | il cielo, le colline, neve/braci/stelle/vento |
| `js/impila.js` | dove cade un pezzo, il posto migliore, gli sprite impilati (lo usano la torre laterale e l'anteprima) |
| `js/torre.js` | la torre laterale |
| `js/lab.js` | l'anteprima della torre |
| `js/mondi.js` | i mondi a scorrimento laterale (pin + scrub + containerAnimation) |
| `js/effetti.js` | nastri, testi a parole, ventaglio, inclinazione, tasti magnetici, roadmap |
| `js/libera.js` | l'altimetro della costruzione libera |
| `js/pezzi.js` | fisica (Matter.js): lettere del marchio, pile di pezzi |
| `js/scroll.js` | rivelazioni, tilt, parallasse, contatori |
| `js/render.js`, `js/i18n.js` | le parti costruite dai dati e le lingue |

Nota: non mettere `scroll-behavior: smooth` su `html`. ScrollTrigger misura le sezioni spostando lo scroll e con lo scroll morbido sbaglia tutte le posizioni (torre, cielo, rivelazioni). I link interni scorrono gia' da `js/util.js`.
