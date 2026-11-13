import { h } from '@stencil/core';
import { ChartSeries, valuesOf } from './chart-scale';

interface BarsProps {
  labels: string[];
  series: ChartSeries[];
  active?: number;
  value: (value: number) => string;
  onActive: (index: number) => void;
}

/** Barres horizontales, pour comparer des catégories : nom à gauche, valeur au bout de chaque barre. */
export const Bars = ({ labels, series, active, value, onActive }: BarsProps) => {
  const max = Math.max(0, ...valuesOf(series));
  return (
    <ul class="bars">
      {labels.map((label, i) => (
        <li class={{ row: true, on: i === active, dim: active !== undefined && i !== active }} onPointerEnter={() => onActive(i)}>
          <span class="bar-label">{label}</span>
          <span class="bar-track">
            {series.map((s, j) => (
              <span class="bar-line">
                <span class={`bar s${j + 1}`} style={{ '--ratio': String(max ? Math.max(0, s.values[i] ?? 0) / max : 0) }} />
                <span class="bar-value">
                  {value(s.values[i] ?? 0)}
                  {series.length > 1 && <span class="sr-only"> {s.name}</span>}
                </span>
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
};

interface DonutProps {
  slices: { label: string; value: number }[];
  size: number;
  active?: number;
  value: (value: number) => string;
  share: (value: number) => string;
  totalLabel: string;
  onActive: (index: number) => void;
}

const fixed = (n: number) => n.toFixed(2);

/** Secteur d'anneau entre les angles a0 et a1 (radians, 0 = à droite, sens horaire). */
const sector = (c: number, outer: number, inner: number, a0: number, a1: number) => {
  const end = Math.min(a1, a0 + 2 * Math.PI - 1e-4);
  const at = (r: number, a: number) => `${fixed(c + r * Math.cos(a))} ${fixed(c + r * Math.sin(a))}`;
  const large = end - a0 > Math.PI ? 1 : 0;
  return `M${at(outer, a0)}A${outer} ${outer} 0 ${large} 1 ${at(outer, end)}L${at(inner, end)}A${inner} ${inner} 0 ${large} 0 ${at(inner, a0)}Z`;
};

/** Parts d'un tout : le centre affiche le total, ou la part survolée ; la légende donne nom et pourcentage. */
export const Donut = ({ slices, size, active, value, share, totalLabel, onActive }: DonutProps) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let angle = -Math.PI / 2;
  const arcs = slices.map((slice) => {
    const from = angle;
    angle += total ? (slice.value / total) * 2 * Math.PI : 0;
    return [from, angle];
  });
  const focus = active === undefined ? undefined : slices[active];
  return (
    <div class="donut">
      <div class="ring" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {slices.map((slice, i) =>
            slice.value > 0 ? (
              <path class={{ slice: true, [`s${i + 1}`]: true, dim: active !== undefined && i !== active }} d={sector(size / 2, size / 2 - 2, size * 0.31, arcs[i][0], arcs[i][1])} onPointerEnter={() => onActive(i)} />
            ) : null,
          )}
        </svg>
        <div class="center" aria-hidden="true">
          <strong>{value(focus ? focus.value : total)}</strong>
          <span>{focus ? `${focus.label} · ${share(focus.value)}` : totalLabel}</span>
        </div>
      </div>
      <ul class="legend legend-donut">
        {slices.map((slice, i) => (
          <li class={{ on: i === active }} onPointerEnter={() => onActive(i)}>
            <span class={`swatch s${i + 1}`} aria-hidden="true" />
            <span class="legend-name">{slice.label}</span>
            <span class="legend-share">{share(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
