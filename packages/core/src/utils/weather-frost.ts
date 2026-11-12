import { layer, paint, random, type EffectFactory } from './weather-shared';

/** Segment de cristal ; at : distance parcourue depuis le bord, qui fixe le moment où il apparaît. */
type Segment = { x1: number; y1: number; x2: number; y2: number; at: number; main: boolean };

/** Longueur d'un segment, en pixels CSS. */
const STEP = 3;
/** Durée de la pousse du givre, en millisecondes. */
const GROW = 7000;

/** Branche de givre : une tige qui ondule un peu et lance des rameaux à 60°, comme la glace. */
const branch = (segments: Segment[], x: number, y: number, angle: number, length: number, depth: number, at: number) => {
  for (let i = 0; i * STEP < length && segments.length < 7000; i++) {
    angle += random(-0.07, 0.07);
    const nx = x + Math.cos(angle) * STEP;
    const ny = y + Math.sin(angle) * STEP;
    segments.push({ x1: x, y1: y, x2: nx, y2: ny, at: at + i * STEP, main: depth < 2 });
    // Des aiguilles de part et d'autre, plus courtes vers la pointe : la branche prend l'allure d'une fougère.
    const rest = length - i * STEP;
    if (depth < 3 && i > 1 && Math.random() < 0.42 - depth * 0.1) {
      const side = i % 2 ? 1 : -1;
      branch(segments, nx, ny, angle + (side * Math.PI) / 3, rest * random(0.2, 0.45), depth + 1, at + i * STEP);
    }
    x = nx;
    y = ny;
  }
};

/** Givre : des cristaux poussent depuis les bords et les coins, puis restent avec un léger scintillement. */
export const frost: EffectFactory = ({ width, height, ratio }, { tint, shade }, settled) => {
  const short = Math.min(width, height);
  const segments: Segment[] = [];
  // Plus de givre dans les coins : le verre y refroidit plus vite.
  const corner = (x: number, y: number) => Math.max(0, 1 - Math.min(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y)) / (short * 0.6));
  const edges: [number, number, number][] = [];
  for (let x = random(0, 14); x < width; x += random(7, 16)) edges.push([x, 0, Math.PI / 2], [x, height, -Math.PI / 2]);
  for (let y = random(0, 14); y < height; y += random(7, 16)) edges.push([0, y, 0], [width, y, Math.PI]);
  for (const [x, y] of [[0, 0], [width, 0], [0, height], [width, height]]) {
    const inward = Math.atan2(height / 2 - y, width / 2 - x);
    for (let i = 0; i < 5; i++) edges.push([x, y, inward + random(-0.7, 0.7)]);
  }
  for (const [x, y, normal] of edges) {
    const reach = short * random(0.05, 0.15) * (1 + 1.8 * corner(x, y) ** 1.5);
    branch(segments, x, y, normal + random(-0.6, 0.6), reach, 0, random(0, 20));
  }
  segments.sort((a, b) => a.at - b.at);
  const far = segments.length ? segments[segments.length - 1].at : 1;
  const sparkles = Array.from({ length: Math.min(18, segments.length) }, () => ({ ...segments[Math.floor(Math.random() * segments.length)], phase: random(0, 10), size: random(2, 4) }));
  // Le contour sombre et le cristal clair, chacun opaque dans son calque : là où les branches se croisent, rien ne s'additionne.
  const etch = layer(width, height, ratio);
  const ice = layer(width, height, ratio);
  let grown = settled ? GROW : 0;
  let shown = 0;
  let time = 0;

  // Les nouveaux segments sont ajoutés au calque une seule fois : chaque frame ne fait que le recopier.
  const reveal = () => {
    const until = segments.findIndex((segment) => segment.at > (grown / GROW) * far);
    const end = until < 0 ? segments.length : until;
    if (end <= shown) return;
    for (const [{ context }, [r, g, b], extra] of [[etch, shade, 1.2], [ice, tint, 0]] as const) {
      context.lineCap = 'round';
      context.strokeStyle = `rgb(${r},${g},${b})`;
      for (const main of [true, false]) {
        context.lineWidth = (main ? 1.1 : 0.6) + extra;
        context.beginPath();
        for (let i = shown; i < end; i++) {
          if (segments[i].main !== main) continue;
          context.moveTo(segments[i].x1, segments[i].y1);
          context.lineTo(segments[i].x2, segments[i].y2);
        }
        context.stroke();
      }
    }
    shown = end;
  };

  const haze = (context: CanvasRenderingContext2D, amount: number) => {
    const depth = short * 0.24;
    for (const [x, y, w, h, x0, y0, x1, y1] of [
      [0, 0, width, depth, 0, 0, 0, depth],
      [0, height - depth, width, depth, 0, height, 0, height - depth],
      [0, 0, depth, height, 0, 0, depth, 0],
      [width - depth, 0, depth, height, width, 0, width - depth, 0],
    ]) {
      const fade = context.createLinearGradient(x0, y0, x1, y1);
      fade.addColorStop(0, paint(tint, 0.5 * amount));
      fade.addColorStop(1, paint(tint, 0));
      context.fillStyle = fade;
      context.fillRect(x, y, w, h);
    }
  };

  reveal();
  return {
    draw(context, dt) {
      time += dt;
      grown = Math.min(GROW, grown + dt);
      reveal();
      haze(context, grown / GROW);
      context.globalAlpha = shade[3] * 0.12;
      context.drawImage(etch.canvas, 0, 0, width, height);
      context.globalAlpha = tint[3] * 0.6;
      context.drawImage(ice.canvas, 0, 0, width, height);
      context.globalAlpha = 1;
      if (grown < GROW) return;
      context.strokeStyle = paint(tint, 0.7);
      context.lineWidth = 1;
      for (const { x2, y2, phase, size } of sparkles) {
        context.globalAlpha = Math.max(0, Math.sin(time * 0.0012 + phase)) ** 10;
        context.beginPath();
        context.moveTo(x2 - size, y2);
        context.lineTo(x2 + size, y2);
        context.moveTo(x2, y2 - size);
        context.lineTo(x2, y2 + size);
        context.stroke();
      }
      context.globalAlpha = 1;
    },
  };
};
