import type { Messages } from './i18n';

export type ChartType = 'column' | 'bar' | 'line' | 'area' | 'donut';

export interface ChartSeries {
  name: string;
  values: number[];
}

/** Toutes les valeurs de toutes les séries. */
export const valuesOf = (series: ChartSeries[]) => ([] as number[]).concat(...series.map((s) => s.values));

/** Couleurs de la palette (--cr-color-chart-1 à 8), vérifiée pour le daltonisme : au-delà, regroupez ou découpez le graphique. */
export const MAX_SERIES = 8;
/** Parts d'un donut ; les suivantes sont regroupées dans « Autres ». */
export const MAX_SLICES = 6;

/** Graduations rondes (1, 2, 2,5 ou 5 × 10ⁿ) qui couvrent [min, max], zéro compris. */
export const niceTicks = (min: number, max: number, count = 4) => {
  const low = Math.min(0, min);
  const high = Math.max(0, max) === low ? low + 1 : Math.max(0, max);
  const rough = (high - low) / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough)!;
  const start = Math.floor(low / step) * step;
  const steps = Math.ceil((high - start) / step - 1e-9);
  return Array.from({ length: steps + 1 }, (_, index) => Number((start + index * step).toPrecision(12)));
};

/** Valeurs mises en forme dans la langue ; les graduations passent en notation compacte (12 k) à partir de 10 000. */
export const formatters = (locale: string, options: Intl.NumberFormatOptions = {}, max = 0) => ({
  value: new Intl.NumberFormat(locale, options).format,
  tick: new Intl.NumberFormat(locale, { ...options, ...(Math.abs(max) >= 10_000 ? { notation: 'compact', maximumFractionDigits: 1 } : {}) }).format,
});

/** Parts d'un donut : la première série, les plus petites au-delà de MAX_SLICES regroupées dans « Autres ». */
export const slicesOf = (labels: string[], series: ChartSeries[], m: Messages) => {
  const parts = labels.map((label, index) => ({ label, value: Math.max(0, series[0]?.values[index] ?? 0) }));
  if (parts.length <= MAX_SLICES) return parts;
  const kept = [...parts].sort((a, b) => b.value - a.value).slice(0, MAX_SLICES - 1);
  const rest = parts.filter((part) => !kept.includes(part)).reduce((sum, part) => sum + part.value, 0);
  return [...parts.filter((part) => kept.includes(part)), { label: m.chartOther, value: rest }];
};

/** Texte lu pour une catégorie : « Mars : Ventes 1 240 €, Retours 80 € ». */
export const pointText = (label: string, series: ChartSeries[], index: number, format: (value: number) => string, m: Messages) =>
  m.chartPoint(label, series.map((s) => (series.length > 1 ? `${s.name} ${format(s.values[index] ?? 0)}` : format(s.values[index] ?? 0))).join(', '));

export const percent = (value: number, total: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(total ? value / total : 0);
