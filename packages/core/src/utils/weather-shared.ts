/** Types et petits outils communs aux effets de cr-weather. */

/** Couleur [r, g, b, a] ; a de 0 à 1. */
export type Color = [number, number, number, number];
/** Couleurs du thème : reflets clairs (tint), ombres (shade), lumière chaude (warm). */
export type Palette = { tint: Color; shade: Color; warm: Color };
/** Taille du canvas en pixels CSS, et pixels du canvas par pixel CSS. */
export type Size = { width: number; height: number; ratio: number };
/** Un effet dessine une image en pixels CSS ; dt en millisecondes, 0 pour redessiner la même image. */
export type Effect = { draw(context: CanvasRenderingContext2D, dt: number): void; wipe?(x: number, y: number): void };
/** settled : l'effet démarre sur une image déjà installée (givre poussé, gouttes posées) plutôt que de zéro. */
export type EffectFactory = (size: Size, palette: Palette, settled: boolean) => Effect;

/** Couleur CSS avec son opacité multipliée par alpha, pour le canvas. */
export const paint = ([r, g, b, a]: Color, alpha = 1) => `rgba(${r},${g},${b},${+(a * alpha).toFixed(3)})`;
export const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Canvas d'appoint à la taille donnée en pixels CSS, déjà mis à l'échelle. */
export const layer = (width: number, height: number, ratio: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext('2d')!;
  context.scale(ratio, ratio);
  return { canvas, context };
};
