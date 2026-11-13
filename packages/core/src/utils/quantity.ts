import type { Messages } from './i18n';

export type QuantityAnimation = 'press' | 'slide' | 'ripple' | 'stretch' | 'spin' | 'halo';

export interface Bounds {
  min: number;
  max?: number;
  step: number;
}

// shortcut: les nombres en notation exponentielle (1e-7) comptent 0 décimale, à revoir si un pas aussi fin devient utile.
const decimals = (n: number) => (String(n).split('.')[1] ?? '').length;

/** Nombre de décimales des valeurs permises : celles du pas et du minimum, d'où partent les pas. */
export const precision = ({ min, step }: Bounds) => Math.max(decimals(min), decimals(step));

const round = (n: number, bounds: Bounds) => Number(n.toFixed(precision(bounds)));

/** Plus grande valeur permise : max ramené sur la grille des pas. */
export const top = (bounds: Bounds) =>
  bounds.max === undefined ? undefined : round(bounds.min + Math.floor((bounds.max - bounds.min) / bounds.step + 1e-9) * bounds.step, bounds);

export const clamp = (n: number, { min, max }: Bounds) => Math.min(Math.max(n, min), max ?? Infinity);

/** Valeur après count pas (négatif : vers le bas), posée sur la grille des pas comme stepUp() natif, sans sortir des bornes. */
export const stepBy = (value: number, count: number, bounds: Bounds) => {
  const n = (value - bounds.min) / bounds.step;
  const index = count > 0 ? Math.floor(n + 1e-9) + count : Math.ceil(n - 1e-9) + count;
  return Math.min(Math.max(round(bounds.min + index * bounds.step, bounds), bounds.min), top(bounds) ?? Infinity);
};

const STEPS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };

/** Valeur visée par une touche du motif spinbutton (flèches, pages, Début, Fin) ; undefined si la touche ne change pas la valeur. */
export const keyTarget = (key: string, value: number, bounds: Bounds) =>
  key in STEPS ? stepBy(value, STEPS[key], bounds) : key === 'Home' ? bounds.min : key === 'End' ? top(bounds) : undefined;

/** Nombre tapé : virgule ou point décimal ; undefined si vide, NaN si illisible. */
export const parse = (text: string) => {
  const clean = text.trim().replace(',', '.').replace('−', '-');
  return clean ? Number(clean) : undefined;
};

export const formatter = (locale: string, bounds: Bounds) => {
  const format = new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: precision(bounds) });
  return (n: number) => format.format(n);
};

/** État de validité et message, dans l'ordre des contrôles natifs : manquant, hors bornes, hors pas. */
export const quantityValidity = (
  value: number | undefined,
  required: boolean,
  bounds: Bounds,
  m: Messages,
  format: (n: number) => string,
): [ValidityStateFlags, string] => {
  if (value === undefined) return required ? [{ valueMissing: true }, m.required] : [{}, ''];
  const range = m.quantityRange(format(bounds.min), bounds.max === undefined ? undefined : format(bounds.max));
  if (value < bounds.min) return [{ rangeUnderflow: true }, range];
  if (bounds.max !== undefined && value > bounds.max) return [{ rangeOverflow: true }, range];
  const n = (value - bounds.min) / bounds.step;
  if (Math.abs(n - Math.round(n)) < 1e-9) return [{}, ''];
  const upper = stepBy(value, 1, bounds);
  return [{ stepMismatch: true }, m.quantityStep(format(stepBy(value, -1, bounds)), upper > value ? format(upper) : undefined, format(bounds.step))];
};

/** Bornes atteintes (− ou + passe en aria-disabled) et largeur du nombre : celle de la plus longue borne, pour que les boutons ne bougent pas. */
export const limits = (value: number | undefined, bounds: Bounds, format: (n: number) => string) => ({
  atMin: value !== undefined && value <= bounds.min,
  atMax: value !== undefined && bounds.max !== undefined && value >= top(bounds)!,
  chars: Math.max(2, format(bounds.min).length, bounds.max === undefined ? 3 : format(bounds.max).length),
});

/** Relance les animations du pas, même si la classe qui les porte était déjà là (même geste que replayError). */
export const replayStep = (host: HTMLElement) => {
  host.setAttribute('data-step-replay', '');
  host.getBoundingClientRect();
  host.removeAttribute('data-step-replay');
};
