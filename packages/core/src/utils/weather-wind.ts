import { layer, paint, random, type EffectFactory } from './weather-shared';

/** Longueur de l'image d'un filet de vent, en pixels CSS. */
const STREAK = 160;

/** Vent : de fins filets d'air et quelques feuilles et poussières emportés à travers le verre, par rafales. */
export const wind: EffectFactory = ({ width, height, ratio }, { tint, shade, warm }) => {
  const streak = layer(STREAK, 6, ratio);
  for (const [color, y, alpha] of [[shade, 3.6, 0.3], [tint, 2.8, 0.9]] as const) {
    const fade = streak.context.createLinearGradient(0, 0, STREAK, 0);
    fade.addColorStop(0, paint(color, 0));
    fade.addColorStop(0.85, paint(color, alpha));
    fade.addColorStop(1, paint(color, 0));
    streak.context.strokeStyle = fade;
    streak.context.lineWidth = 1.1;
    streak.context.lineCap = 'round';
    streak.context.beginPath();
    streak.context.moveTo(0, y);
    streak.context.lineTo(STREAK, y);
    streak.context.stroke();
  }
  const count = (per: number, most: number) => Math.round(Math.min(most, (width * height) / per));
  const streaks = Array.from({ length: count(3500, 36) }, () => ({ x: random(-STREAK, width), y: random(0, height), length: random(40, 130), speed: random(0.35, 0.7), tilt: random(-0.08, 0.04), phase: random(0, 10) }));
  const leaves = Array.from({ length: count(22000, 6) }, () => ({ x: random(0, width), y: random(0, height), size: random(7, 10), speed: random(0.16, 0.26), spin: random(0, 6), flip: random(0, 6), phase: random(0, 10) }));
  const specks = Array.from({ length: count(5000, 24) }, () => ({ x: random(0, width), y: random(0, height), r: random(0.6, 1.5), speed: random(0.25, 0.5), phase: random(0, 10) }));
  let time = 0;

  const leaf = (context: CanvasRenderingContext2D, size: number) => {
    context.beginPath();
    context.moveTo(-size, 0);
    context.quadraticCurveTo(0, -size * 0.85, size, 0);
    context.quadraticCurveTo(0, size * 0.85, -size, 0);
    context.fill();
    context.beginPath();
    context.moveTo(-size * 1.3, 0);
    context.lineTo(size * 0.8, 0);
    context.stroke();
  };

  return {
    draw(context, dt) {
      time += dt;
      // Rafales : la force du vent monte et retombe, tout accélère ensemble.
      const gust = 0.75 + 0.35 * Math.sin(time * 0.0007) + 0.15 * Math.sin(time * 0.0023);
      const move = dt * gust;
      for (const s of streaks) {
        s.x += s.speed * move;
        if (s.x > width) Object.assign(s, { x: -s.length - random(0, width * 0.5), y: random(0, height) });
        context.save();
        context.translate(s.x, s.y + Math.sin(time * 0.002 + s.phase) * 3);
        context.rotate(s.tilt);
        context.globalAlpha = 0.5 + 0.5 * Math.min(1, gust);
        context.drawImage(streak.canvas, 0, -3, s.length, 6);
        context.restore();
      }
      context.globalAlpha = 1;
      context.fillStyle = paint(shade, 0.35);
      for (const s of specks) {
        s.x += s.speed * move;
        if (s.x > width + 4) Object.assign(s, { x: -4, y: random(0, height) });
        context.beginPath();
        context.arc(s.x, s.y + Math.sin(s.x * 0.03 + s.phase) * 6, s.r, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = paint(warm, 0.95);
      context.strokeStyle = paint(shade, 0.45);
      context.lineWidth = 0.8;
      for (const l of leaves) {
        l.x += l.speed * move;
        l.spin += dt * 0.004 * gust;
        l.flip += dt * 0.006;
        if (l.x > width + 20) Object.assign(l, { x: -20, y: random(0, height) });
        context.save();
        context.translate(l.x, l.y + Math.sin(l.x * 0.02 + l.phase) * 16);
        context.rotate(l.spin);
        // Le cosinus aplatit la feuille : elle semble tourner sur elle-même en volant.
        context.scale(1, 0.3 + 0.7 * Math.abs(Math.cos(l.flip)));
        leaf(context, l.size);
        context.restore();
      }
    },
  };
};
