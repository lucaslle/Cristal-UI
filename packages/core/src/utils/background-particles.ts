/** Un point tourne lentement autour de sa place (x, y) : le nuage reste bien réparti, sans point qui sorte du cadre. */
type Point = { x: number; y: number; radius: number; reach: number; pace: number; phase: number };

/** Distance en pixels sous laquelle deux points sont reliés. */
const LINK = 100;
/** Rayon en pixels autour du pointeur : les points s'y écartent et s'y relient. */
const NEAR = 130;
/** Écart maximal, en pixels, d'un point collé au pointeur. */
const PUSH = 36;

// Suite R2 (nombre plastique) : des places bien réparties, et la même première image à chaque chargement.
const spread = (index: number, step: number) => (0.5 + index * step) % 1;
// Hachage sans motif pour le mouvement : tiré de la suite R2, il ferait bouger les points en rangs.
const scatter = (index: number, seed: number) => Math.abs(Math.sin(index * 12.9898 + seed) * 43758.5453) % 1;

/** Points qui dérivent lentement dans un canvas, reliés par un trait pâle à leurs voisins proches. */
export class Particles {
  private context: CanvasRenderingContext2D;
  private points: Point[] = [];
  private width = 0;
  private height = 0;
  private colors = ['', ''];
  private frame = 0;
  private last = 0;
  /** Temps d'animation écoulé, en millisecondes ; il n'avance pas pendant les pauses. */
  private time = 0;
  private resizer = new ResizeObserver(() => this.resize());
  private target?: { x: number; y: number };
  /** Pointeur suivi avec un peu de retard, et force de son effet (0 à 1) qui monte et retombe en douceur. */
  private hover = { x: 0, y: 0, strength: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d')!;
    this.resizer.observe(canvas);
  }

  /** Lance ou arrête l'animation ; arrêtée, plus aucune image n'est calculée. */
  toggle(running: boolean) {
    if (running === this.frame > 0) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (!running) return;
    this.readColors();
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Position du pointeur dans le canvas, ou undefined quand il en sort. */
  point(position?: { x: number; y: number }) {
    if (position && !this.target && this.hover.strength < 0.01) Object.assign(this.hover, position);
    this.target = position;
  }

  destroy() {
    this.toggle(false);
    this.resizer.disconnect();
  }

  // Les couleurs du thème sont posées en CSS sur le canvas (color et border-color) : le navigateur les calcule pour nous.
  private readColors() {
    const style = getComputedStyle(this.canvas);
    this.colors = [style.color, style.borderTopColor];
  }

  private resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.width = width;
    this.height = height;
    const count = Math.min(160, Math.round((width * height) / 2600));
    this.points = Array.from({ length: count }, (_, index) => ({
      x: spread(index, 0.7548777) * width,
      y: spread(index, 0.5698403) * height,
      radius: 1.2 + scatter(index, 3) * 1.6,
      reach: 20 + scatter(index, 4) * 30,
      pace: (0.25 + scatter(index, 2) * 0.3) / 1000,
      phase: scatter(index, 1) * Math.PI * 2,
    }));
    this.readColors();
    this.draw();
  }

  private tick = (now: number) => {
    this.time += Math.max(0, Math.min(now - this.last, 50));
    this.last = now;
    const { hover, target } = this;
    hover.strength += ((target ? 1 : 0) - hover.strength) * 0.08;
    if (target) {
      hover.x += (target.x - hover.x) * 0.25;
      hover.y += (target.y - hover.y) * 0.25;
    }
    this.draw();
    this.frame = requestAnimationFrame(this.tick);
  };

  private draw() {
    const { context, time } = this;
    const at = this.points.map((point) => {
      const angle = time * point.pace + point.phase;
      return { x: point.x + point.reach * Math.sin(angle), y: point.y + point.reach * Math.cos(angle * 0.8), radius: point.radius };
    });
    const { hover } = this;
    if (hover.strength > 0.01) {
      for (const point of at) {
        const distance = Math.hypot(point.x - hover.x, point.y - hover.y) || 1;
        if (distance >= NEAR) continue;
        const push = (1 - distance / NEAR) ** 2 * PUSH * hover.strength;
        point.x += ((point.x - hover.x) / distance) * push;
        point.y += ((point.y - hover.y) / distance) * push;
      }
    }
    context.clearRect(0, 0, this.width, this.height);
    context.strokeStyle = this.colors[1];
    context.lineWidth = 1;
    for (let i = 0; i < at.length; i++) {
      for (let j = i + 1; j < at.length; j++) {
        const distance = Math.hypot(at[i].x - at[j].x, at[i].y - at[j].y);
        if (distance >= LINK) continue;
        context.globalAlpha = (1 - distance / LINK) * 0.3;
        context.beginPath();
        context.moveTo(at[i].x, at[i].y);
        context.lineTo(at[j].x, at[j].y);
        context.stroke();
      }
    }
    if (hover.strength > 0.01) {
      for (const point of at) {
        const distance = Math.hypot(point.x - hover.x, point.y - hover.y);
        if (distance >= NEAR * 1.3) continue;
        context.globalAlpha = (1 - distance / (NEAR * 1.3)) * 0.45 * hover.strength;
        context.beginPath();
        context.moveTo(hover.x, hover.y);
        context.lineTo(point.x, point.y);
        context.stroke();
      }
    }
    context.fillStyle = this.colors[0];
    context.globalAlpha = 0.4;
    for (const point of at) {
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }
}
