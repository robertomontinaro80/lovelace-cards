/*
 * Advent Calendar Card per Home Assistant
 * Resource: /local/advent-calendar-card.js (tipo: JavaScript module)
 * Card:     type: custom:advent-calendar-card
 * Opzioni:  title, year, test_day (solo per provare, es. test_day: 10)
 */

const PHRASES = [
  "Dicembre è arrivato: accendi una candela e respira piano. Il bello sta per cominciare.",
  "Le piccole cose fanno le feste grandi: una tazza calda, una coperta, una persona cara.",
  "Oggi dillo a qualcuno: «mi fa piacere che tu ci sia».",
  "Il profumo di cannella è una carezza che arriva dalla cucina.",
  "Non serve la neve per fare magia: basta un po' di luce alla finestra.",
  "Sii gentile oggi. Un sorriso è il regalo più facile da impacchettare.",
  "Ogni luce che accendi è un modo per ricordare al buio che non ha vinto.",
  "Cioccolata calda, cuore tranquillo. Il resto può aspettare.",
  "Il tempo passato insieme è un regalo che non finisce mai di essere scartato.",
  "Anche oggi qualcuno pensa a te con un sorriso. Fidati.",
  "Un biscotto, un film, un divano: la ricetta perfetta per una sera d'inverno.",
  "Rallentare è permesso. Anche le stelle brillano senza fretta.",
  "Scrivi un biglietto a mano per qualcuno: farà più rumore di mille messaggi.",
  "La casa più bella è quella in cui si sta bene, anche con le luci un po' storte.",
  "Stasera guarda il cielo: l'inverno regala i tramonti più dolci.",
  "Condividere raddoppia la gioia. Soprattutto se c'è un dolce di mezzo.",
  "Hai fatto più strada di quanta pensi, quest'anno. Complimenti a te.",
  "Le tradizioni sono abbracci che arrivano dal passato. Tienile strette.",
  "Una telefonata a chi è lontano vale più di un pacco con il fiocco.",
  "Il silenzio di una sera d'inverno è una canzone che conosci già.",
  "Dopo la notte più lunga, la luce torna sempre. Sta già tornando.",
  "Prepara qualcosa con le tue mani: il fatto in casa ha un sapore tutto speciale.",
  "Quasi ci siamo. Respira, sorridi, e lascia che l'attesa sia già una festa.",
  "Domani è Natale: stanotte il mondo trattiene il fiato e tutto profuma di attesa. ✨",
  "Buon Natale! Che la tua casa sia piena di calore, e il tuo cuore ancora di più. 🎄",
];

const COLORS = ["#b9473f", "#d9893f", "#6f8f62", "#a8603f", "#cf9a3c", "#8a5a48"];

class AdventCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = { title: "Calendario dell'Avvento", ...config };
    this._year = this._config.year || new Date().getFullYear();
    this._key = `advent-calendar-${this._year}`;
    this._opened = this._load();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  getCardSize() {
    return 7;
  }

  _load() {
    try {
      return JSON.parse(localStorage.getItem(this._key)) || [];
    } catch (e) {
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(this._key, JSON.stringify(this._opened));
    } catch (e) {
      /* storage non disponibile: pazienza */
    }
  }

  _unlockedUpTo() {
    if (this._config.test_day) return Number(this._config.test_day);
    const now = new Date();
    let n = 0;
    for (let d = 1; d <= 25; d++) {
      if (now >= new Date(this._year, 11, d, 0, 0, 0)) n = d;
    }
    return n;
  }

  _daysToChristmas() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const xmas = new Date(this._year, 11, 25);
    return Math.round((xmas - today) / 86400000);
  }

  _subtitle(unlocked) {
    if (this._config.test_day) return "Modalità prova";
    const left = this._daysToChristmas();
    if (left > 1) return `Mancano ${left} giorni a Natale`;
    if (left === 1) return "Domani è Natale!";
    if (left === 0) return "Oggi è Natale! 🎁";
    return "Buone feste!";
  }

  _render() {
    const unlocked = this._unlockedUpTo();
    const tiles = [];
    for (let d = 1; d <= 25; d++) {
      const isLocked = d > unlocked;
      const isOpen = this._opened.includes(d);
      const isToday = d === unlocked && !isOpen;
      const cls = ["tile", isLocked ? "locked" : "", isOpen ? "open" : "", isToday ? "today" : ""]
        .filter(Boolean)
        .join(" ");
      const icon = isLocked ? "🔒" : isOpen ? "★" : "";
      tiles.push(
        `<button class="${cls}" data-day="${d}" style="--c:${COLORS[(d - 1) % COLORS.length]}">
           <span class="num">${d}</span>
           <span class="ico">${icon}</span>
         </button>`
      );
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          position: relative;
          overflow: hidden;
          padding: 20px 16px 22px;
          background: linear-gradient(165deg, #fff6ea 0%, #ffe4cc 100%);
          color: #5b3a2e;
          font-family: var(--primary-font-family, Roboto, sans-serif);
        }
        ha-card::before, ha-card::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255,200,120,.35), transparent 70%);
        }
        ha-card::before { width: 220px; height: 220px; top: -90px; right: -70px; }
        ha-card::after { width: 260px; height: 260px; bottom: -120px; left: -90px; }
        .header { position: relative; text-align: center; margin-bottom: 16px; }
        .title { font-size: 24px; font-weight: 500; line-height: 1.2; }
        .sub { margin-top: 4px; font-size: 14px; opacity: .75; }
        .grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 10px;
        }
        .tile {
          position: relative;
          aspect-ratio: 1;
          border: none;
          border-radius: 14px;
          background: var(--c);
          color: #fff8ef;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(120, 60, 30, .25), inset 0 0 0 2px rgba(255,255,255,.25);
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .tile:hover:not(.locked) { transform: translateY(-2px) scale(1.04); }
        .tile:active:not(.locked) { transform: scale(.96); }
        .num { font-size: 26px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,.2); }
        .ico { position: absolute; top: 4px; right: 7px; font-size: 12px; }
        .tile.locked { opacity: .5; filter: saturate(.5); cursor: not-allowed; box-shadow: none; }
        .tile.open { background: #f3d9b8; color: #8a5a48; box-shadow: inset 0 0 0 2px #d9b98f; }
        .tile.open .num { text-shadow: none; }
        .tile.today { animation: glow 2s ease-in-out infinite; }
        @keyframes glow {
          0%, 100% { box-shadow: 0 3px 8px rgba(120,60,30,.25), 0 0 0 0 rgba(255,190,90,.8); }
          50% { box-shadow: 0 3px 8px rgba(120,60,30,.25), 0 0 0 7px rgba(255,190,90,0); }
        }
        .tile.shake { animation: shake .4s; }
        @keyframes shake {
          25% { transform: translateX(-4px); } 75% { transform: translateX(4px); }
        }
        .hint {
          position: relative; text-align: center; min-height: 18px;
          margin-top: 14px; font-size: 13px; opacity: .8;
        }
        .overlay {
          position: absolute; inset: 0; z-index: 2;
          display: none; align-items: center; justify-content: center;
          padding: 20px;
          background: rgba(91, 58, 46, .45);
          backdrop-filter: blur(3px);
        }
        .overlay.show { display: flex; animation: fade .25s ease; }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        .paper {
          width: 100%; max-width: 360px;
          padding: 26px 22px 20px;
          text-align: center;
          background: #fffaf2;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(80,40,20,.35);
          animation: pop .35s cubic-bezier(.2,1.4,.4,1);
        }
        @keyframes pop { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .paper .big { font-size: 40px; line-height: 1; }
        .paper .dayl { margin-top: 6px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .65; }
        .paper .phrase { margin: 14px 0 18px; font-size: 18px; line-height: 1.5; }
        .close {
          border: none; border-radius: 999px; padding: 9px 22px;
          background: #b9473f; color: #fff8ef; font-family: inherit; font-size: 14px; cursor: pointer;
        }
      </style>
      <ha-card>
        <div class="header">
          <div class="title">🎄 ${this._config.title}</div>
          <div class="sub">${this._subtitle(unlocked)}</div>
        </div>
        <div class="grid">${tiles.join("")}</div>
        <div class="hint"></div>
        <div class="overlay">
          <div class="paper">
            <div class="big">🎁</div>
            <div class="dayl"></div>
            <div class="phrase"></div>
            <button class="close">Grazie ♥</button>
          </div>
        </div>
      </ha-card>`;

    const root = this.shadowRoot;
    root.querySelectorAll(".tile").forEach((el) =>
      el.addEventListener("click", () => this._onTile(el, Number(el.dataset.day), unlocked))
    );
    const overlay = root.querySelector(".overlay");
    root.querySelector(".close").addEventListener("click", () => this._closeOverlay());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this._closeOverlay();
    });
  }

  _onTile(el, day, unlocked) {
    const root = this.shadowRoot;
    if (day > unlocked) {
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      const left = day - unlocked;
      root.querySelector(".hint").textContent =
        left === 1 ? "Pazienza, questa si apre domani 🕯️" : `Pazienza, mancano ${left} giorni 🕯️`;
      return;
    }
    root.querySelector(".hint").textContent = "";
    const overlay = root.querySelector(".overlay");
    root.querySelector(".dayl").textContent = `${day} dicembre`;
    root.querySelector(".phrase").textContent = this._phraseFor(day);
    overlay.classList.add("show");
    if (!this._opened.includes(day)) {
      this._opened.push(day);
      this._save();
      this._pendingRefresh = true;
    }
  }

  _phraseFor(day) {
    const prefix = this._config.entity_prefix || "input_text.advent_phrase_";
    const st = this._hass && this._hass.states[prefix + day];
    const v = st && st.state ? String(st.state).trim() : "";
    if (v && !["unknown", "unavailable"].includes(v)) return v;
    return PHRASES[day - 1];
  }

  _closeOverlay() {
    if (this._pendingRefresh) {
      this._pendingRefresh = false;
      this._render();
    } else {
      this.shadowRoot.querySelector(".overlay").classList.remove("show");
    }
  }
}

if (!customElements.get("advent-calendar-card")) {
  customElements.define("advent-calendar-card", AdventCalendarCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "advent-calendar-card",
  name: "Calendario dell'Avvento",
  description: "Una frase dolce al giorno, dall'1 al 25 dicembre.",
});
