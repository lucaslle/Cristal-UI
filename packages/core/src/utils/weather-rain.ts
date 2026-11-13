import { layer, paint, random, type EffectFactory, type Palette } from './weather-shared';

/** Goutte sur le verre. life : millisecondes avant de sécher ; run : distance depuis la dernière gouttelette laissée ; wake : traînée. */
type Drop = { x: number; y: number; r: number; life: number; run: number; wake: number; seed: number };

const SPRITE = 64;
/** Rayon de la goutte dans son image, rapporté au côté de l'image. */
const BODY = 0.4;

/** Goutte dessinée une fois puis copiée : ombre portée, corps qui réfracte (sombre en haut, clair en bas), bord, reflet. */
const dropSprite = ({ tint, shade }: Palette) => {
  const { canvas, context } = layer(SPRITE, SPRITE, 1);
  const m = SPRITE / 2;
  const r = SPRITE * BODY;
  const shadow = context.createRadialGradient(m + r * 0.15, m + r * 0.3, r * 0.7, m + r * 0.15, m + r * 0.3, r * 1.2);
  shadow.addColorStop(0, paint(shade, 0.18));
  shadow.addColorStop(1, paint(shade, 0));
  context.fillStyle = shadow;
  context.fillRect(0, 0, SPRITE, SPRITE);
  // Une goutte est une lentille : le haut renvoie le sol, sombre ; le bas renvoie le ciel, clair.
  const body = context.createLinearGradient(0, m - r, 0, m + r);
  body.addColorStop(0, paint(shade, 0.24));
  body.addColorStop(0.45, paint(shade, 0.04));
  body.addColorStop(0.7, paint(tint, 0.25));
  body.addColorStop(1, paint(tint, 0.85));
  context.fillStyle = body;
  context.beginPath();
  context.arc(m, m, r, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = paint(shade, 0.16);
  context.lineWidth = 1.5;
  context.stroke();
  context.fillStyle = paint(tint, 1);
  context.beginPath();
  context.ellipse(m - r * 0.36, m - r * 0.4, r * 0.24, r * 0.14, -0.7, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = paint(tint, 0.6);
  context.beginPath();
  context.ellipse(m + r * 0.3, m + r * 0.55, r * 0.22, r * 0.09, -0.4, 0, Math.PI * 2);
  context.fill();
  return canvas;
};

/** Pluie (fine ou forte) : les gouttes se posent, grossissent en fusionnant, puis coulent en laissant une traînée. */
const rainOn = (storm: boolean): EffectFactory => ({ width, height }, palette) => {
  const sprite = dropSprite(palette);
  const area = width * height;
  const rate = (area / 8000) * (storm ? 3 : 1);
  const heavy = storm ? 3.4 : 4.2;
  const still: Drop[] = [];
  const runners: Drop[] = [];
  const most = Math.min(storm ? 380 : 240, area / (storm ? 240 : 360));
  const lifetime = () => (storm ? random(3000, 8000) : random(7000, 16000));
  const streaks = storm ? Array.from({ length: Math.round(Math.min(60, area / 2200)) }, () => ({ x: random(0, width), y: random(0, height), length: random(14, 30), speed: random(0.9, 1.4) })) : [];
  let pending = 0;
  let kick = 0;

  const run = (drop: Drop) => {
    if (runners.length >= (storm ? 14 : 6)) return false;
    still.splice(still.indexOf(drop), 1);
    runners.push(drop);
    return true;
  };

  // Une goutte qui touche une voisine fusionne avec elle (aires additionnées) ; trop lourde, elle se met à couler.
  const land = (x: number, y: number, r: number, life = lifetime()) => {
    const near = still.find((drop) => Math.hypot(drop.x - x, drop.y - y) < (drop.r + r) * 0.9);
    if (!near) {
      if (still.length < most) still.push({ x, y, r, life, run: 0, wake: 0, seed: random(0, 100) });
      return;
    }
    const total = near.r ** 2 + r ** 2;
    near.x = (near.x * near.r ** 2 + x * r ** 2) / total;
    near.y = (near.y * near.r ** 2 + y * r ** 2) / total;
    near.r = Math.min(Math.sqrt(total), 6.5);
    near.life = Math.max(near.life, life);
    if (near.r > heavy) run(near);
  };

  const fall = (drop: Drop, dt: number) => {
    // Une goutte glisse par à-coups : sa vitesse varie le long du chemin.
    const speed = (0.025 + drop.r * 0.014) * (0.35 + 0.65 * Math.abs(Math.sin(drop.seed + drop.y * 0.045))) * (storm ? 1.7 : 1);
    const step = speed * dt;
    drop.y += step;
    drop.x += Math.sin(drop.y * 0.05 + drop.seed) * step * 0.2;
    drop.wake = Math.min(drop.wake + step, drop.r * (storm ? 16 : 9));
    drop.run += step;
    if (drop.run > drop.r * 2.4) {
      drop.run = 0;
      still.push({ x: drop.x + random(-0.6, 0.6), y: drop.y - drop.r * 1.7, r: drop.r * random(0.2, 0.34), life: random(2500, 6000), run: 0, wake: 0, seed: 0 });
      drop.r *= 0.985;
    }
    for (let i = still.length - 1; i >= 0; i--) {
      const other = still[i];
      if (other.y > drop.y - drop.r && Math.hypot(other.x - drop.x, other.y - drop.y) < drop.r + other.r) {
        drop.r = Math.min(Math.sqrt(drop.r ** 2 + other.r ** 2 * 0.8), 6.5);
        still.splice(i, 1);
      }
    }
  };

  const update = (dt: number) => {
    for (pending += (rate * dt) / 1000; pending >= 1; pending--) land(random(0, width), random(0, height), 0.8 + Math.random() ** 2.2 * 3.6);
    // De temps en temps, la plus grosse goutte posée cède et coule, même sans fusion.
    kick -= dt;
    if (kick < 0 && still.length) {
      kick = storm ? random(250, 700) : random(1200, 3200);
      run(still.reduce((big, drop) => (drop.r > big.r ? drop : big)));
    }
    for (const drop of still) drop.life -= dt;
    for (let i = still.length - 1; i >= 0; i--) if (still[i].life <= 0) still.splice(i, 1);
    for (const drop of runners) fall(drop, dt);
    for (let i = runners.length - 1; i >= 0; i--) if (runners[i].y - runners[i].r > height) runners.splice(i, 1);
    for (const streak of streaks) {
      streak.y += streak.speed * dt;
      streak.x += streak.speed * dt * 0.2;
      if (streak.y > height + streak.length) Object.assign(streak, { y: -streak.length, x: random(-height * 0.2, width) });
    }
  };

  // Image de départ : un verre déjà mouillé, quelques gouttes en train de couler.
  for (let i = 0; i < most * 0.7; i++) land(random(0, width), random(0, height), 0.8 + Math.random() ** 2.2 * 3.6, random(1000, 16000));
  for (let i = 0; i < (storm ? 6 : 3); i++) {
    const drop = { x: random(width * 0.05, width * 0.95), y: random(0, height * 0.6), r: random(3.6, 5), life: 0, run: 0, wake: 0, seed: random(0, 100) };
    runners.push(drop);
    for (let step = 0; step < 8; step++) fall(drop, 40);
  }

  const put = (context: CanvasRenderingContext2D, drop: Drop, stretch = 1) => {
    const side = (drop.r / BODY) * 0.98;
    context.drawImage(sprite, drop.x - side / 2, drop.y - side * stretch * 0.55, side, side * stretch);
  };

  return {
    draw(context, dt) {
      if (dt) update(dt);
      if (storm) {
        const film = context.createLinearGradient(0, 0, 0, height);
        film.addColorStop(0, paint(palette.shade, 0));
        film.addColorStop(1, paint(palette.shade, 0.05));
        context.fillStyle = film;
        context.fillRect(0, 0, width, height);
      }
      for (const drop of still) {
        context.globalAlpha = Math.min(1, drop.life / 900);
        put(context, drop);
      }
      context.globalAlpha = 1;
      context.lineCap = 'round';
      for (const drop of runners) {
        const wake = context.createLinearGradient(0, drop.y - drop.wake, 0, drop.y);
        wake.addColorStop(0, paint(palette.shade, 0));
        wake.addColorStop(1, paint(palette.shade, 0.12));
        context.strokeStyle = wake;
        context.lineWidth = drop.r * 0.9;
        context.beginPath();
        context.moveTo(drop.x, drop.y - drop.wake);
        context.lineTo(drop.x, drop.y);
        context.stroke();
        put(context, drop, 1.18);
      }
      if (!storm) return;
      context.lineWidth = 1;
      for (const [color, alpha, shift] of [[palette.shade, 0.25, 1], [palette.tint, 0.35, 0]] as const) {
        context.strokeStyle = paint(color, alpha);
        context.beginPath();
        for (const { x, y, length } of streaks) {
          context.moveTo(x + shift, y);
          context.lineTo(x + shift - length * 0.2, y - length);
        }
        context.stroke();
      }
    },
  };
};

export const rain = rainOn(false);
export const storm = rainOn(true);
