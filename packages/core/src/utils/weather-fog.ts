import { layer, paint, random, type EffectFactory } from './weather-shared';

/** Échelle des calques de buée : elle est floue, un quart de la résolution suffit et coûte seize fois moins. */
const SCALE = 0.25;
/** Rayon du doigt qui essuie, en pixels CSS. */
const FINGER = 22;
/** Temps pour que la buée revienne aux deux tiers sur une trace essuyée, en millisecondes. */
const REFOG = 4000;
/** Pas du retour de la buée : par petites touches, un canal alpha de 8 bits arrondirait chaque frame à zéro. */
const REFOG_STEP = 200;

/** Brouillard : une buée qui dérive sur le verre ; le pointeur l'essuie comme un doigt, elle revient lentement. */
export const fog: EffectFactory = ({ width, height, ratio }, { tint, shade }) => {
  const w = Math.ceil(width * SCALE);
  const h = Math.ceil(height * SCALE);
  // Où la buée s'est déposée (opacité seule) : pleine au départ, creusée par le doigt.
  const mask = layer(w, h, 1);
  mask.context.fillRect(0, 0, w, h);
  // Volutes de brume, deux fois plus larges que le verre pour défiler sans couture.
  const wisps = layer(w * 2, h, 1);
  for (let i = 0; i < 46; i++) {
    const x = random(0, w);
    const y = random(-h * 0.1, h * 1.1);
    const r = random(0.12, 0.35) * Math.max(w, h);
    for (const shift of [0, w]) {
      const blob = wisps.context.createRadialGradient(x + shift, y, 0, x + shift, y, r);
      blob.addColorStop(0, paint(tint, random(0.1, 0.24)));
      blob.addColorStop(1, paint(tint, 0));
      wisps.context.fillStyle = blob;
      wisps.context.fillRect(0, 0, w * 2, h);
    }
  }
  // Fines gouttelettes de condensation, posées une fois.
  const beads = layer(width, height, ratio);
  for (let i = 0; i < (width * height) / 90; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const r = random(0.4, 1.1);
    beads.context.fillStyle = paint(shade, 0.1);
    beads.context.beginPath();
    beads.context.arc(x + r * 0.3, y + r * 0.4, r, 0, Math.PI * 2);
    beads.context.fill();
    beads.context.fillStyle = paint(tint, 0.55);
    beads.context.beginPath();
    beads.context.arc(x, y, r * 0.8, 0, Math.PI * 2);
    beads.context.fill();
  }
  const view = layer(w, h, 1);
  const wet = layer(width, height, ratio);
  let drift = 0;
  let refog = 0;
  let last: { x: number; y: number; at: number } | undefined;

  const rub = (x: number, y: number) => {
    const brush = mask.context.createRadialGradient(x, y, 0, x, y, FINGER * SCALE);
    brush.addColorStop(0, 'rgba(0,0,0,0.9)');
    brush.addColorStop(0.6, 'rgba(0,0,0,0.6)');
    brush.addColorStop(1, 'rgba(0,0,0,0)');
    mask.context.fillStyle = brush;
    mask.context.fillRect(x - FINGER, y - FINGER, FINGER * 2, FINGER * 2);
  };

  return {
    wipe(x, y) {
      const now = performance.now();
      const from = last && now - last.at < 150 ? last : { x, y };
      mask.context.globalCompositeOperation = 'destination-out';
      // Des touches rapprochées le long du geste : un mouvement rapide laisse une trace continue.
      const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (FINGER / 3)));
      for (let i = 1; i <= steps; i++) rub((from.x + ((x - from.x) * i) / steps) * SCALE, (from.y + ((y - from.y) * i) / steps) * SCALE);
      mask.context.globalCompositeOperation = 'source-over';
      last = { x, y, at: now };
    },
    draw(context, dt) {
      drift = (drift + dt * 0.0016) % w;
      refog += dt;
      if (refog >= REFOG_STEP) {
        mask.context.fillStyle = `rgba(0,0,0,${1 - Math.exp(-refog / REFOG)})`;
        mask.context.fillRect(0, 0, w, h);
        refog = 0;
      }
      const { context: v } = view;
      v.globalCompositeOperation = 'source-over';
      v.clearRect(0, 0, w, h);
      v.fillStyle = paint(tint, 0.34);
      v.fillRect(0, 0, w, h);
      v.drawImage(wisps.canvas, -drift, 0);
      v.globalCompositeOperation = 'destination-in';
      v.drawImage(mask.canvas, 0, 0);
      context.drawImage(view.canvas, 0, 0, width, height);
      // Les gouttelettes suivent la buée : essuyées avec elle, revenues avec elle.
      wet.context.globalCompositeOperation = 'copy';
      wet.context.drawImage(beads.canvas, 0, 0, width, height);
      wet.context.globalCompositeOperation = 'destination-in';
      wet.context.drawImage(mask.canvas, 0, 0, width, height);
      context.drawImage(wet.canvas, 0, 0, width, height);
    },
  };
};
