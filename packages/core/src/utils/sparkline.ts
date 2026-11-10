const MORPH_MS = 500;

/** Hauteurs de 0 (minimum) à 1 (maximum) ; une série plate reste au milieu. */
export const heights = (values: number[]) => {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  return values.map((value) => (span ? (value - min) / span : 0.5));
};

/** Rééchantillonne une courbe sur count points, pour la transformer en une courbe d'un autre nombre de points. */
export const resample = (points: number[], count: number) =>
  Array.from({ length: count }, (_, index) => {
    if (points.length < 2) return points[0] ?? 0.5;
    const at = count > 1 ? (index * (points.length - 1)) / (count - 1) : 0;
    const low = Math.floor(at);
    const high = Math.min(points.length - 1, low + 1);
    return points[low] + (points[high] - points[low]) * (at - low);
  });

/** Fait passer chaque point de from à to, image par image ; renvoie de quoi l'arrêter. */
export const morph = (from: number[], to: number[], onFrame: (points: number[]) => void) => {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / MORPH_MS);
    const eased = 1 - (1 - progress) ** 3;
    onFrame(to.map((point, index) => from[index] + (point - from[index]) * eased));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
};

/** Coordonnées en pixels, avec une marge pour l'épaisseur du trait et le point final. */
export const coordinates = (points: number[], width: number, height: number, pad = 4) =>
  points.map((point, index) => [points.length > 1 ? pad + (index * (width - 2 * pad)) / (points.length - 1) : width / 2, height - pad - point * (height - 2 * pad)]);

export const trend = (values: number[]) => Math.sign(values[values.length - 1] - values[0]) as -1 | 0 | 1;
