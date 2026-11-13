import { rain, storm } from './weather-rain';
import { fog } from './weather-fog';
import { frost } from './weather-frost';
import { clear, heat } from './weather-light';
import { wind } from './weather-wind';
import { layer, type Color, type Effect, type EffectFactory, type Palette, type Size } from './weather-shared';

export type WeatherCondition = 'clear' | 'rain' | 'storm' | 'fog' | 'frost' | 'heat' | 'wind';

const effects: Record<WeatherCondition, EffectFactory> = { clear, rain, storm, fog, frost, heat, wind };
/** Durée du fondu d'un effet à l'autre, en millisecondes. */
const FADE = 900;

/** La météo dessinée sur le verre de cr-weather : un seul canvas, une image par frame seulement quand elle tourne. */
export class Weather {
  private context: CanvasRenderingContext2D;
  private size: Size = { width: 0, height: 0, ratio: 1 };
  private palette?: Palette;
  private colors = '';
  private condition?: WeatherCondition;
  private current?: Effect;
  private previous?: Effect;
  private scratch?: ReturnType<typeof layer>;
  private fade = 1;
  private frame = 0;
  private last = 0;
  private frames = 0;
  private paused = false;
  private resizer = new ResizeObserver(() => this.resize());

  constructor(private canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d')!;
    this.resizer.observe(canvas);
  }

  /** Effet à montrer, animation en marche ou non ; paused fait démarrer un nouvel effet sur une image installée. */
  update(condition: WeatherCondition, running: boolean, paused: boolean) {
    this.paused = paused;
    if (condition !== this.condition) {
      this.condition = condition;
      this.previous = running && this.frame && this.current ? this.current : undefined;
      this.fade = this.previous ? 0 : 1;
      this.current = this.build();
      if (!running) this.draw(0);
    }
    this.toggle(running);
  }

  /** Essuie le verre sous le pointeur (brouillard), même à l'arrêt : c'est l'utilisateur qui le fait. */
  wipe(x: number, y: number) {
    if (!this.current?.wipe) return;
    this.current.wipe(x, y);
    if (!this.frame) this.draw(0);
  }

  destroy() {
    this.toggle(false);
    this.resizer.disconnect();
  }

  private toggle(running: boolean) {
    if (running === this.frame > 0) return;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (!running) return;
    if (this.readColors()) this.current = this.build(true);
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  // Un effet reconstruit (taille ou thème changés) repart de son image installée : le givre ne repousse pas à chaque redimensionnement.
  private build(settled = this.paused) {
    if (!this.size.width || !this.palette || !this.condition) return undefined;
    return effects[this.condition](this.size, this.palette, settled);
  }

  // Les couleurs du thème sont posées en CSS sur le canvas (color, border-color, outline-color) : le navigateur les calcule,
  // un pixel peint les ramène en [r, g, b, a]. Renvoie true quand elles ont changé (thème basculé).
  private readColors() {
    const style = getComputedStyle(this.canvas);
    const colors = [style.color, style.borderTopColor, style.outlineColor];
    if (colors.join() === this.colors) return false;
    this.colors = colors.join();
    const probe = layer(1, 1, 1).context;
    const [tint, shade, warm] = colors.map((color): Color => {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    });
    this.palette = { tint, shade, warm };
    return true;
  }

  private resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.size = { width, height, ratio };
    this.scratch = undefined;
    this.previous = undefined;
    this.readColors();
    this.current = this.build(this.paused || !!this.current);
    this.draw(0);
  }

  private tick = (now: number) => {
    const dt = Math.max(0, Math.min(now - this.last, 50));
    this.last = now;
    // Environ une fois par seconde : un thème basculé en cours de route reconstruit l'effet à ses nouvelles couleurs.
    // shortcut: à l'arrêt, un thème basculé garde les anciennes couleurs jusqu'à la reprise ou un redimensionnement ; observer data-theme si ça gêne.
    if (++this.frames % 60 === 0 && this.readColors()) {
      this.previous = undefined;
      this.current = this.build(true);
    }
    this.draw(dt);
    this.frame = requestAnimationFrame(this.tick);
  };

  private draw(dt: number) {
    const { context, size } = this;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.current) return;
    if (this.previous) {
      this.fade = Math.min(1, this.fade + dt / FADE);
      this.blend(this.previous, 1 - this.fade, dt);
      if (this.fade === 1) this.previous = undefined;
    }
    this.blend(this.current, this.fade, dt);
    context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
  }

  // Pendant un fondu, chaque effet passe par un canvas d'appoint posé avec son opacité : ils n'ont rien à savoir du fondu.
  private blend(effect: Effect, alpha: number, dt: number) {
    const { context, size } = this;
    const target = alpha < 1 ? (this.scratch ??= layer(size.width, size.height, size.ratio)).context : context;
    target.setTransform(1, 0, 0, 1, 0, 0);
    if (target !== context) target.clearRect(0, 0, target.canvas.width, target.canvas.height);
    target.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    target.globalAlpha = 1;
    target.globalCompositeOperation = 'source-over';
    effect.draw(target, dt);
    if (target === context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = alpha;
    context.drawImage(target.canvas, 0, 0);
    context.globalAlpha = 1;
  }
}
