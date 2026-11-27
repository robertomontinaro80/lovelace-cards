# 🎄 Christmas per Home Assistant

Una raccolta di personalizzazioni natalizie per la dashboard di Home Assistant:

- **[Calendario dell'Avvento](#parte-1-calendario-dellavvento)**: ogni giorno si scopre una frase dolce, **generata dall'AI** e dedicata a un componente della famiglia (o a tutti). Si può aprire solo la casella del giorno corrente e quelle dei giorni passati, mai quelle future.
- **[Neve a schermo intero](#parte-2-neve)**: una card invisibile che fa nevicare sulla dashboard, con un pulsante per accenderla e spegnerla.
- **[Tema Cozy Christmas](#parte-3-tema-cozy-christmas)**: un tema caldo ed elegante (bordeaux, oro, verde abete e crema) con card a pacchetto regalo, albero tenue e lucine animate, in due varianti.

Le tre parti sono **indipendenti**: puoi installarne una sola o tutte.

<p align="center">
  <img src="christmas/christmas-advent-calendar/docs/calendario.png" alt="Il calendario dell'Avvento" width="48%">
  <img src="christmas/christmas-advent-calendar/docs/frase.png" alt="La frase del giorno" width="48%">
</p>

## Indice

- [Struttura del repository](#struttura-del-repository)
- [Dove vanno i file in Home Assistant](#dove-vanno-i-file-in-home-assistant)
- [Requisiti](#requisiti)
- [Parte 1: Calendario dell'Avvento](#parte-1-calendario-dellavvento)
- [Parte 2: Neve](#parte-2-neve)
- [Parte 3: Tema Cozy Christmas](#parte-3-tema-cozy-christmas)

---

## Struttura del repository

```
.
├── README.md
└── christmas/
    ├── christmas-advent-calendar/
    │   ├── www/
    │   │   └── advent-calendar-card.js     # la card (grafica e logica)
    │   ├── packages/
    │   │   └── advent_calendar.yaml        # i 25 helper input_text che contengono le frasi
    │   ├── scripts.yaml                    # lo script che genera e salva la frase del giorno
    │   └── docs/
    │       ├── calendario.png              # screenshot
    │       └── frase.png                   # screenshot
    ├── christmas-snow/
    │   └── www/
    │       └── snow-card.js                # la card della neve
    └── themes/
        ├── cozy_christmas.yaml             # tema, variante con barra opaca e luci sotto
        └── cozy_christmas_transparent.yaml # tema, variante con barra trasparente e luci dentro
```

Più, da creare a mano in Home Assistant (non sono nel repository): l'**automazione** che lancia lo script del calendario ogni giorno ([passo 5](#5-automazione)) e l'**helper** `input_boolean.neve` per la neve ([installazione della neve](#installazione)).

Nel repository `scripts.yaml` usa nomi segnaposto (`mamma`, `papà`, `figlio1`, `figlio2`): vanno sostituiti con quelli della tua famiglia (vedi [passo 3](#3-script-scriptsyaml)).

## Dove vanno i file in Home Assistant

I file del repository vanno copiati nella cartella di configurazione di Home Assistant (`/config/`, quella dove c'è `configuration.yaml`). Le sottocartelle del repository **non** si ricreano: ogni file va nella destinazione indicata qui.

| File nel repository | Destinazione in Home Assistant |
|---|---|
| `christmas/christmas-advent-calendar/www/advent-calendar-card.js` | `/config/www/advent-calendar-card.js` |
| `christmas/christmas-advent-calendar/packages/advent_calendar.yaml` | `/config/packages/advent_calendar.yaml` |
| `christmas/christmas-advent-calendar/scripts.yaml` | blocco da **aggiungere** al tuo `/config/scripts.yaml` |
| `christmas/christmas-snow/www/snow-card.js` | `/config/www/snow-card.js` |
| `christmas/themes/cozy_christmas.yaml` | `/config/themes/cozy_christmas.yaml` |
| `christmas/themes/cozy_christmas_transparent.yaml` | `/config/themes/cozy_christmas_transparent.yaml` |

La cartella `/config/www/` è esposta da Home Assistant come `/local/`.

## Requisiti

- Home Assistant 2025.12 o successivo (per il calendario serve un'integrazione AI che offra il servizio **AI Task**, per esempio *Google Generative AI*).
- Accesso ai file di configurazione (File editor, Samba, SSH).
- Un utente **amministratore** con la **Modalità avanzata** attiva (profilo → Modalità avanzata), per vedere la voce *Risorse* nelle dashboard.
- Per il tema non serve nient'altro: nessuna risorsa e nessun `card-mod`.

---

# Parte 1: Calendario dell'Avvento

*File in `christmas/christmas-advent-calendar/`.*

- Grafica calda e dolce, con il font standard di Home Assistant (Roboto).
- 25 caselle (1-25 dicembre), con animazioni e conto alla rovescia a Natale.
- Frase del giorno scritta dall'AI tramite il servizio **AI Task**, con tono adatto a ciascuno (bambini piccoli, genitori, tutta la famiglia).
- Frasi statiche di riserva: se l'AI non risponde la casella non resta mai vuota.

## Come funziona

1. Ogni giorno alle 00:05 un'**automazione** lancia lo script `advent_generate_phrase`.
2. Lo **script** (`scripts.yaml`) chiede all'AI una frase per quel giorno, scegliendo il destinatario da un programma fisso, e la salva nell'helper `input_text.advent_phrase_N`.
3. Gli **helper** (`packages/advent_calendar.yaml`) conservano le 25 frasi.
4. La **card** (`www/advent-calendar-card.js`) mostra le caselle e legge la frase dall'helper. Se l'helper è vuoto usa una frase statica di riserva.

Le caselle già aperte sono salvate nel browser del singolo dispositivo (`localStorage`): su telefono e tablet lo stato è separato.

## 1. Entità AI Task

1. Impostazioni → Dispositivi e servizi → la tua integrazione AI (es. **Google Generative AI**).
2. Controlla che tra i servizi ci sia **AI Task**. Se manca, aggiungila con **Aggiungi servizio**.
3. In Strumenti per sviluppatori → Stati cerca `ai_task.` e annota l'entity_id (es. `ai_task.google_ai_task`): servirà nello script.

## 2. Helper (`packages/advent_calendar.yaml`)

Il file dichiara i 25 helper `input_text.advent_phrase_1` … `input_text.advent_phrase_25`, che contengono le frasi (massimo 255 caratteri ciascuno).

1. Copia `christmas/christmas-advent-calendar/packages/advent_calendar.yaml` in `/config/packages/advent_calendar.yaml`.
2. In `configuration.yaml` abilita i packages, dentro il blocco `homeassistant:` (se esiste già non crearne un secondo, aggiungi solo la riga `packages`):

```yaml
homeassistant:
  packages: !include_dir_named packages
```

3. Strumenti per sviluppatori → YAML → **Controlla configurazione**, poi **riavvia Home Assistant**. Per i nuovi helper non basta *Ricarica YAML*.
4. Gli helper definiti in YAML non compaiono nella pagina *Helper* dell'interfaccia: per verificarli cerca `advent` in Strumenti per sviluppatori → Stati.

## 3. Script (`scripts.yaml`)

Il file `christmas/christmas-advent-calendar/scripts.yaml` contiene lo script `advent_generate_phrase`. **Non sovrascrivere il tuo `/config/scripts.yaml`**: se ne hai già uno, aggiungi solo il blocco `advent_generate_phrase` con la sua indentazione. L'entità risultante è `script.advent_generate_phrase`.

Lo script:

1. si ferma subito se `day` non è tra 1 e 25;
2. sceglie il destinatario di quel giorno dalla lista `programma`;
3. chiama `ai_task.generate_data` con le istruzioni;
4. salva la risposta (senza virgolette, massimo 250 caratteri) in `input_text.advent_phrase_<day>`.

### Cosa personalizzare

| Cosa | Dove | Note |
|---|---|---|
| Entità AI | `entity_id: ai_task.…` | Metti la tua entità AI Task |
| Nomi della famiglia | `programma` e `profili` | Sostituisci `mamma`, `papà`, `figlio1`, `figlio2` con i nomi reali. I nomi usati in `programma` devono essere **identici** alle chiavi di `profili` |
| Descrizione delle persone | `profili` | Età, ruolo, tono desiderato. Il testo guida l'AI: un bambino piccolo avrà frasi cortissime, i genitori frasi più affettuose |
| Chi riceve quale giorno | `programma` | Lista di 25 voci (una per giorno). Il valore `'tutti'` genera una frase per tutta la famiglia |
| Tono e regole | istruzioni finali | Lunghezza massima, "niente virgolette", "non inventare episodi", ecc. |

> **Attenzione:** nelle stringhe di `profili` **non usare apostrofi**, perché spezzano il template (scrivi "dell amore", non "dell'amore").

> **Privacy:** se il repository è pubblico, tieni i nomi segnaposto e **non committare** chiavi API o nomi reali.

Lo script **sovrascrive sempre** l'helper del giorno indicato: è il modo per rigenerare una frase che non ti piace.

## 4. Card (`www/advent-calendar-card.js`)

### Copia il file

Copia `christmas/christmas-advent-calendar/www/advent-calendar-card.js` in `/config/www/advent-calendar-card.js`. Il percorso `/config/www/` è esposto da Home Assistant come `/local/`.

### Aggiungila alle risorse ⚠️

La card è una *custom card*: finché non la registri tra le **risorse** della dashboard, Home Assistant non la conosce e mostra l'errore *"Custom element not found"*.

1. Apri il **profilo** (nome in basso a sinistra) e attiva **Modalità avanzata**.
2. Vai in **Impostazioni → Dashboard**.
3. Tocca **⋮** in alto a destra → **Risorse**.
4. **Aggiungi risorsa**:
   - **URL:** `/local/advent-calendar-card.js`
   - **Tipo:** **Modulo JavaScript**
5. Salva e ricarica la pagina (Ctrl+F5).

In alternativa, direttamente da browser: `http://IL-TUO-HA:8123/config/lovelace/resources`.

Per controllare che il file sia raggiungibile apri `http://IL-TUO-HA:8123/local/advent-calendar-card.js`: se vedi il codice, è a posto.

### Aggiungila alla dashboard

Modifica la dashboard (matita) → **Aggiungi card** → **Manuale** e incolla:

```yaml
type: custom:advent-calendar-card
```

### Opzioni

| Opzione | Default | Descrizione |
|---|---|---|
| `title` | `Calendario dell'Avvento` | Titolo in alto |
| `year` | anno corrente | Anno di riferimento (decide quali caselle sono sbloccate) |
| `test_day` | non impostata | Forza il "giorno corrente" per provare (es. `test_day: 10`). **Toglila a prova finita** |
| `entity_prefix` | `input_text.advent_phrase_` | Prefisso degli helper, se li hai chiamati diversamente |

Esempio:

```yaml
type: custom:advent-calendar-card
title: Aspettando Natale
test_day: 10
```

Il `type` e le opzioni devono stare su righe separate, con lo spazio dopo i due punti (`test_day: 10`).

### Aggiornare la card

Browser e app Companion mettono in cache le risorse. Dopo aver sostituito il file cambia l'URL della risorsa in `/local/advent-calendar-card.js?v=2` (poi `v=3`, …) e ricarica con Ctrl+F5. Nell'app mobile: Impostazioni → Companion app → Debug → **Reimposta la cache del frontend**.

## 5. Automazione

Crea l'automazione da Impostazioni → Automazioni e scene → **Crea automazione** → ⋮ → **Modifica in YAML**:

```yaml
alias: "Avvento - frase del giorno"
description: "Genera la frase del giorno alle 00:05 e al riavvio di HA, se ancora vuota"
triggers:
  - trigger: time
    at: "00:05:00"
  - trigger: homeassistant
    event: start
conditions:
  - condition: template
    value_template: >-
      {{ now().month == 12 and 1 <= now().day <= 25
         and states('input_text.advent_phrase_' ~ now().day) in ['', 'unknown'] }}
actions:
  - action: script.advent_generate_phrase
    data:
      day: "{{ now().day }}"
mode: single
```

- Genera solo dal 1 al 25 dicembre e **solo se l'helper del giorno è vuoto**: non sovrascrive mai frasi già create.
- Il trigger `homeassistant: start` recupera i giorni persi se Home Assistant era spento a mezzanotte.

### Reset per l'anno successivo (consigliato)

A fine stagione gli helper contengono ancora le frasi di quest'anno e la condizione "helper vuoto" impedirebbe la generazione l'anno dopo. Questa seconda automazione li svuota il 30 novembre (non provata: controllala il primo anno):

```yaml
alias: "Avvento - reset frasi"
triggers:
  - trigger: time
    at: "00:00:00"
conditions:
  - condition: template
    value_template: "{{ now().month == 11 and now().day == 30 }}"
actions:
  - repeat:
      count: 25
      sequence:
        - action: input_text.set_value
          target:
            entity_id: "input_text.advent_phrase_{{ repeat.index }}"
          data:
            value: ""
mode: single
```

## 6. Provare tutto

1. **Script:** Strumenti per sviluppatori → Azioni → `script.advent_generate_phrase` con `day: 1` (il numero della casella, non la data di oggi). Dopo qualche secondo `input_text.advent_phrase_1` deve contenere una frase.
2. **Card:** imposta `test_day: 10`, tocca la casella 1 e controlla che compaia la frase appena generata. Poi togli `test_day`.
3. **AI o frase di riserva?** Se l'helper del giorno contiene testo e coincide con quello mostrato, è dell'AI. Se è vuoto, la card sta usando la frase statica.

## 7. Mostrare il calendario solo a dicembre (facoltativo)

1. Impostazioni → Dispositivi e servizi → Helper → **Crea helper** → **Template** → **Sensore binario**, nome `Avvento attivo`, modello di stato:

```
{{ now().month == 12 }}
```

2. Sulla griglia che contiene la card: ⋮ → **Visibilità** → condizione **Entità** → `binary_sensor.avvento_attivo` → stato **On**. In YAML:

```yaml
visibility:
  - condition: state
    entity: binary_sensor.avvento_attivo
    state: "on"
```

In modalità modifica le card nascoste restano visibili: esci dalla modifica per vedere l'effetto.

## Risoluzione dei problemi

| Sintomo | Causa probabile | Soluzione |
|---|---|---|
| *Custom element not found* | Risorsa non registrata o YAML della card sbagliato | Aggiungi la risorsa (passo 4); `type` e opzioni su righe separate |
| La card mostra 24 caselle | File in cache o file sbagliato in `www/` | Apri `/local/advent-calendar-card.js` e cerca `d <= 25`; usa `?v=N` |
| Nessun helper `advent_phrase_*` | Package non letto | Controlla percorso, riga `packages:` in `configuration.yaml`, riavvio completo, *Controlla configurazione* |
| *list object has no element…* | Script lanciato con `day` fuori da 1-25 | Usa un giorno valido |
| Helper vuoto dopo lo script | Entità AI Task errata o quota esaurita | Controlla `entity_id` e i registri (Impostazioni → Sistema → Registri). Con la chiave gratuita di Google aspetta un minuto tra una generazione e l'altra |
| Frase non personalizzata o errore nel template | `programma` e `profili` non coerenti, apostrofi nelle stringhe | I nomi devono coincidere in entrambi; niente apostrofi |

---

# Parte 2: Neve

*File in `christmas/christmas-snow/`. Indipendente dal calendario.*

Home Assistant 2025.12 ha introdotto la *Winter mode* nei Laboratori, ma non ha un'entità o un'azione per attivarla da un pulsante o da un'automazione, ed è legata al singolo utente. Per avere un interruttore si usa una card dedicata, `snow-card.js`.

## Come funziona

- `snow-card` è una card **invisibile**: quando viene caricata fa partire la neve a schermo intero, quando viene rimossa la ferma. Non blocca i tocchi.
- Una **conditional card** la mostra solo quando un interruttore (`input_boolean.neve`) è acceso.
- Un **pulsante** (tile card) accende e spegne l'interruttore.

## Installazione

1. Copia `christmas/christmas-snow/www/snow-card.js` in `/config/www/snow-card.js`.
2. Aggiungila alle **risorse** come per il calendario: Impostazioni → Dashboard → ⋮ → **Risorse** → **Aggiungi risorsa**, URL `/local/snow-card.js`, tipo **Modulo JavaScript**.
3. Crea l'interruttore: Impostazioni → Dispositivi e servizi → Helper → **Crea helper** → **Interruttore**, nome `Neve` (entità `input_boolean.neve`).

## Card da aggiungere

Modifica la dashboard → **Aggiungi card** → **Manuale**.

**Il pulsante** (dove vuoi):

```yaml
type: tile
entity: input_boolean.neve
name: Neve
icon: mdi:snowflake
tap_action:
  action: toggle
```

**La neve** (ovunque nella dashboard, è invisibile):

```yaml
type: conditional
conditions:
  - condition: state
    entity: input_boolean.neve
    state: "on"
card:
  type: custom:snow-card
```

## Impostazioni

Le opzioni vanno sotto `card:`, con la stessa indentazione di `type`:

```yaml
type: conditional
conditions:
  - condition: state
    entity: input_boolean.neve
    state: "on"
card:
  type: custom:snow-card
  flakes: 200
  speed: 1.5
  color: "#ffffff"
```

| Opzione | Default | Descrizione |
|---|---|---|
| `flakes` | `120` | Numero di fiocchi. 120 è una nevicata leggera, 250-300 è fitta |
| `speed` | `1` | Velocità di caduta: 0.5 lenta e dolce, 1 normale, 2 bufera |
| `color` | `"#ffffff"` | Colore in esadecimale, tra virgolette. Su sfondi chiari prova un azzurro come `"#cfe8ff"` |

## Da sapere

- La neve compare solo nelle dashboard che contengono la conditional card: per averla ovunque, aggiungila a ciascuna.
- Lo stato dell'interruttore resta dopo un riavvio e vale per tutti i dispositivi che aprono la dashboard.
- Se le opzioni non sembrano applicate, ricarica con Ctrl+F5 e controlla l'indentazione.
- Per aggiornare il file usa lo stesso trucco della cache: URL della risorsa con `?v=2`.

## Automatizzare la neve (facoltativo)

Accendi l'interruttore da un'automazione, per esempio ogni sera di dicembre al tramonto:

```yaml
alias: "Neve - accendi la sera di dicembre"
triggers:
  - trigger: sun
    event: sunset
conditions:
  - condition: template
    value_template: "{{ now().month == 12 }}"
actions:
  - action: input_boolean.turn_on
    target:
      entity_id: input_boolean.neve
mode: single
```

Per spegnerla a una certa ora usa un'automazione gemella con `input_boolean.turn_off`.

---

# Parte 3: Tema Cozy Christmas

*File in `christmas/themes/`. Indipendente dal calendario e dalla neve.*

Tema caldo ed elegante per la dashboard, in due varianti di file (barra opaca o trasparente) e due modalità (scura e chiara, selezionabili dal profilo). Tutto passa da variabili native del tema: **non serve card-mod** né altre risorse. L'unica animazione sono le lucine di Natale, che sono un'immagine SVG animata incorporata nello sfondo.

## Cosa contiene

- **Palette**: bordeaux, oro caldo, verde abete, crema.
- **Card come pacchetti regalo**: un nastro diagonale (rosso con filetti dorati) taglia l'angolo in alto a destra di ogni card.
- **Sfondo**: un albero di Natale molto tenue al centro e una fila di pacchi regalo appoggiati in basso, come sotto l'albero.
- **Lucine animate**: un filo a festoni con lampadine bianco caldo, ambra, rosso tenue e verde delicato. Si accendono e si spengono dolcemente con uno sfasamento progressivo, per un'onda di luce che scorre lungo il filo.
- **Due modalità**: scura (bordeaux e verde molto scuri, lampadine luminose) e chiara (crema e rosso bordeaux, colori più saturi per restare leggibili). Si cambia da *Profilo → Tema → Modalità*.
- Font standard di Home Assistant.

## Le due varianti

| | `cozy_christmas.yaml` | `cozy_christmas_transparent.yaml` |
|---|---|---|
| Nome nel selettore | **Natale Elegante Luci Sotto** | **Natale Elegante** |
| Barra in alto | Opaca, colore pieno | Trasparente, disegnata nello sfondo |
| Lucine | Appese **sotto** la barra | **Dentro** la barra, sul bordo superiore |
| Scorrimento | Nessun problema | Le card scorrono sotto titolo e icone |
| Consigliato per | Telefoni, uso generale | Tablet a muro e dashboard che non scorrono |

Il nome che vedi nel selettore dei temi è la **chiave in cima al file** (la riga che finisce con `:`), non il nome del file. Se l'hai cambiata, nel selettore compare quella.

**Variante con barra trasparente.** Poiché la barra di Home Assistant è un colore pieno e non può contenere immagini, qui è resa trasparente e ridisegnata nello sfondo, alta 56 px e dello stesso colore. Questo permette alle lucine di stare *dentro* la barra, ma con un compromesso: quando scorri la pagina, le card passano sotto il titolo e le icone, che restano sopra di loro. Su una dashboard che non scorre (tablet a muro) non si nota.

## Installazione

1. Crea la cartella `/config/themes/` se non esiste (accanto a `configuration.yaml`).
2. Copia dentro uno o entrambi i file di `christmas/themes/`. Anche una sottocartella (es. `themes/Christmas/`) va bene, perché la lettura è ricorsiva.
3. In `configuration.yaml` aggiungi (senza duplicare un eventuale blocco `frontend:` già presente):

   ```yaml
   frontend:
     themes: !include_dir_merge_named themes
   ```

4. **Riavvia Home Assistant** (necessario la prima volta, perché la cartella viene letta solo all'avvio).
5. Vai in **Profilo → Tema** e scegli il tema. Il tema si applica per utente: ogni persona della casa lo seleziona dal proprio profilo.
6. Scegli la modalità in **Profilo → Tema → Modalità** (Chiaro, Scuro o Auto). Con Auto segue il sistema operativo del dispositivo.

## Modifiche e cambio di variante

- Dopo aver modificato un file: **Strumenti per sviluppatori → YAML → Ricarica temi**, poi un refresh forzato del browser (Ctrl+Shift+R). Ctrl+Shift+R da solo non basta: i temi sono tenuti in memoria da Home Assistant.
- Per passare da una variante all'altra basta scegliere l'altra dal profilo.
- Se dopo una modifica non vedi cambiamenti, scegli un tema qualsiasi e poi torna a quello giusto, per forzare la rilettura delle variabili.
- Sull'app Companion, se serve: Impostazioni app → Debug → Reimposta cache frontend.

## Verifica rapida (Console del browser, F12)

```js
getComputedStyle(document.documentElement).getPropertyValue('--app-header-background-color')
```

- `transparent`: sta usando la variante con barra trasparente.
- `#1d0f14` (scuro) o `#8c1c2b` (chiaro): sta usando la variante con barra opaca.

## Personalizzazioni

Tutto si trova nelle righe `lovelace-background` e `ha-card-background` di ciascuna modalità.

- **Più visibili albero e pacchi**: abbassa l'opacità delle card in `ha-card-background` (ad esempio da `0.9` a `0.8`). Lo sfondo sta dietro le card, quindi si vede soprattutto negli spazi liberi e in trasparenza.
- **Barra più alta di 56 px** (ad esempio con notch): nella riga `lovelace-background` cambia `0 56px` in `0 72px` (variante con luci sotto) o `100% 56px` in `100% 72px` (variante trasparente).
- **Pacchi in alto invece che in basso**: nella riga `lovelace-background` cambia `repeat-x 0 100%` nella posizione desiderata.
- **Colori**: la palette è in testa al file (`christmas-red`, `christmas-gold`, `christmas-green`, `christmas-cream`); i colori usati da Home Assistant sono nelle sezioni `dark:` e `light:`.

## Limiti noti

- Gli SVG animati nello sfondo funzionano nei browser moderni. Sull'app Companion dipende dalla WebView: se vedi il filo ma le lampadine non si muovono, l'animazione non è supportata da quella versione.
- Su iOS lo sfondo `fixed` a volte scorre insieme alla pagina invece di restare fermo.
- L'animazione continua è leggera, ma su tablet a muro molto vecchi può pesare più di un'immagine statica.
- Il tema non è animato oltre alle lucine (niente neve né scintillii): senza card-mod le animazioni CSS non sono possibili da un tema. Per la neve usa la [Parte 2](#parte-2-neve).
- Due file con la stessa chiave in cima si sovrascrivono: tieni nomi diversi e un solo file per ciascun tema.
