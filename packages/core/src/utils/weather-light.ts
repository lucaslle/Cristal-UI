import { layer, paint, random, type Color, type EffectFactory } from './weather-shared';

/** Période du reflet qui balaie le verre par beau temps, et durée de son passage, en millisecondes. */
const SWEEP = 12000;
const PASS = 6500;

/** Petite étoile à quatre branches, reflet de soleil sur le verre. */
const glint = (context: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  context.beginPath();
  context.moveTo(x - size, y);
  context.quadraticCurveTo(x, y, x, y - size);
  context.quadraticCurveTo(x, y, x + size, y);
  context.quadraticCurveTo(x, y, x, y + size);
  context.quadraticCurveTo(x, y, x - size, y);
  context.fill();
};

const glow = (context: CanvasRenderingContext2D, x: number, y: number, r: number, color: Color, alpha: number) => {
  const halo = context.createRadialGradient(x, y, 0, x, y, r);
  halo.addColorStop(0, paint(color, alpha));
  halo.addColorStop(0.3, paint(color, alpha * 0.45));
  halo.addColorStop(1, paint(color, 0));
  context.fillStyle = halo;
  context.fillRect(x - r, y - r, r * 2, r * 2);
};

/** Bande de reflet verticale, claire au milieu, à recopier tranche par tranche. */
const band = (width: number, height: number, ratio: number, tint: Color) => {
  const sheen = layer(width, height, ratio);
  const fade = sheen.context.createLinearGradient(0, 0, width, 0);
  fade.addColorStop(0, paint(tint, 0));
  fade.addColorStop(0.45, paint(tint, 0.3));
  fade.addColorStop(0.5, paint(tint, 0.55));
  fade.addColorStop(0.55, paint(tint, 0.3));
  fade.addColorStop(1, paint(tint, 0));
  sheen.context.fillStyle = fade;
  sheen.context.fillRect(0, 0, width, height);
  return sheen.canvas;
};

/** Dégagé : un soleil doux dans le coin, ses reflets sur le verre, un éclat qui balaie lentement, quelques scintillements. */
export const clear: EffectFactory = ({ width, height }, { tint, warm }) => {
  const glints = Array.from({ length: 6 }, () => ({ x: random(0.08, 0.92) * width, y: random(0.1, 0.9) * height, phase: random(0, 10), size: random(3, 6) }));
  const big = Math.max(width, height);
  // Départ au milieu d'un passage : l'image fixe montre déjà l'éclat sur le verre.
  let time = PASS * 0.4;
  return {
    draw(context, dt) {
      time += dt;
      const sun = { x: width * 0.86, y: height * 0.04 };
      glow(context, sun.x, sun.y, big * 0.8 * (1 + 0.05 * Math.sin(time * 0.0006)), warm, 0.5);
      glow(context, sun.x, sun.y, big * 0.14, tint, 0.9);
      // Reflets du soleil dans l'objectif, sur la ligne qui traverse le verre.
      const sway = Math.sin(time * 0.0004) * 0.04;
      for (const [k, r, color, alpha] of [[0.7, 0.05, tint, 0.3], [1.05, 0.09, warm, 0.16], [1.35, 0.035, tint, 0.3]] as const) {
        glow(context, sun.x + (width / 2 - sun.x) * (k + sway), sun.y + (height / 2 - sun.y) * (k + sway), big * r, color, alpha);
      }
      const pass = (time % SWEEP) / PASS;
      if (pass < 1) {
        const x = -width * 0.4 + pass * width * 1.8;
        const sheen = context.createLinearGradient(x - 70, 0, x + 70, 0);
        sheen.addColorStop(0, paint(tint, 0));
        sheen.addColorStop(0.5, paint(tint, 0.38));
        sheen.addColorStop(1, paint(tint, 0));
        context.save();
        context.transform(1, 0, -0.45, 1, height * 0.225, 0);
        context.fillStyle = sheen;
        context.fillRect(x - 70, 0, 140, height);
        context.restore();
      }
      context.fillStyle = paint(tint, 1);
      for (const { x, y, phase, size } of glints) {
        context.globalAlpha = Math.max(0, Math.sin(time * 0.0009 + phase)) ** 6;
        glint(context, x, y, size);
      }
      context.globalAlpha = 1;
    },
  };
};

/** Chaleur : une lueur chaude qui monte du bas, et les reflets du verre qui ondulent dans l'air brûlant. */
export const heat: EffectFactory = ({ width, height, ratio }, { tint, warm }) => {
  const big = Math.max(width, height);
  const blobs = Array.from({ length: 7 }, () => ({ x: random(0, width), y: random(0, height * 1.3), r: random(0.22, 0.4) * big, speed: random(0.008, 0.016), phase: random(0, 10) }));
  const sheen = band(140, height, ratio, tint);
  let time = 0;
  return {
    draw(context, dt) {
      time += dt;
      const rise = context.createLinearGradient(0, height, 0, height * 0.3);
      rise.addColorStop(0, paint(warm, 0.65));
      rise.addColorStop(1, paint(warm, 0));
      context.fillStyle = rise;
      context.fillRect(0, 0, width, height);
      for (const blob of blobs) {
        blob.y -= blob.speed * dt;
        if (blob.y + blob.r < 0) Object.assign(blob, { y: height + blob.r, x: random(0, width) });
        glow(context, blob.x + Math.sin(time * 0.0008 + blob.phase) * 14, blob.y, blob.r, warm, 0.3 * Math.min(1, Math.max(0, blob.y / height)));
      }
      // Le reflet est recopié par rangées de pixels décalées en vagues : il tremble comme à travers l'air chaud, sans filtre coûteux.
      const rows = Math.max(2, Math.round(ratio * 2));
      context.setTransform(1, 0, 0, 1, 0, 0);
      for (const [start, alpha] of [[0.12, 0.9], [0.55, 0.45]]) {
        context.globalAlpha = alpha;
        for (let row = 0; row < height * ratio; row += rows) {
          const y = row / ratio;
          const wave = Math.sin(y * 0.06 - time * 0.004) * 3.5 + Math.sin(y * 0.15 + time * 0.0027) * 1.5;
          context.drawImage(sheen, 0, row, sheen.width, rows, Math.round((width * start + (height - y) * 0.35 + wave) * ratio), row, sheen.width, rows);
        }
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.globalAlpha = 1;
      // Des ondes d'air chaud montent, larges et pâles.
      context.strokeStyle = paint(tint, 0.14);
      context.lineWidth = 7;
      for (let k = 0; k < 3; k++) {
        const y = height - ((time * 0.012 + (k * height) / 3) % height);
        context.globalAlpha = Math.sin((y / height) * Math.PI);
        context.beginPath();
        for (let x = 0; x <= width; x += 8) context.lineTo(x, y + Math.sin(x * 0.035 + time * 0.003 + k) * 4);
        context.stroke();
      }
      context.globalAlpha = 1;
    },
  };
};
