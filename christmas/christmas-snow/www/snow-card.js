/*
 * Snow Card per Home Assistant - neve a schermo intero
 * Resource: /local/snow-card.js (tipo: JavaScript module)
 * Card:     type: custom:snow-card
 * Opzioni:  color (default #ffffff), flakes (default 120), speed (default 1)
 *
 * La card non mostra nulla da sola: quando viene caricata fa partire la neve,
 * quando viene rimossa (es. da una conditional card) la neve si ferma.
 */

class SnowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<style>:host{display:none}</style>";
  }

  setConfig(config) {
    this._config = { color: "#ffffff", flakes: 120, speed: 1, ...config };
    if (this._canvas) {
      this._stop();
      this._start();
    }
  }

  set hass(hass) {}

  getCardSize() {
    return 0;
  }

  connectedCallback() {
    this._start();
  }

  disconnectedCallback() {
    this._stop();
  }

  _start() {
    if (this._canvas || !this._config) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999;";
    document.body.appendChild(canvas);
    this._canvas = canvas;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      this._w = window.innerWidth;
      this._h = window.innerHeight;
      canvas.width = this._w * dpr;
      canvas.height = this._h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    this._onResize = resize;
    window.addEventListener("resize", resize);
    resize();

    const { flakes, speed, color } = this._config;
    const rand = (a, b) => a + Math.random() * (b - a);
    this._flakes = Array.from({ length: Number(flakes) }, () => ({
      x: rand(0, this._w),
      y: rand(0, this._h),
      r: rand(1.5, 4.2),
      vy: rand(0.4, 1.4) * Number(speed),
      phase: rand(0, Math.PI * 2),
      amp: rand(0.2, 0.9),
    }));

    const tick = () => {
      ctx.clearRect(0, 0, this._w, this._h);
      ctx.fillStyle = color;
      for (const f of this._flakes) {
        f.y += f.vy;
        f.phase += 0.012;
        f.x += Math.sin(f.phase) * f.amp;
        if (f.y > this._h + 10) {
          f.y = -10;
          f.x = rand(0, this._w);
        }
        if (f.x > this._w + 10) f.x = -10;
        if (f.x < -10) f.x = this._w + 10;
        ctx.globalAlpha = Math.min(1, 0.35 + f.r / 6);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      this._raf = requestAnimationFrame(tick);
    };
    tick();
  }

  _stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    if (this._canvas) this._canvas.remove();
    this._raf = null;
    this._onResize = null;
    this._canvas = null;
  }
}

if (!customElements.get("snow-card")) {
  customElements.define("snow-card", SnowCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "snow-card",
  name: "Neve",
  description: "Fiocchi di neve a schermo intero, da attivare con una conditional card.",
});
