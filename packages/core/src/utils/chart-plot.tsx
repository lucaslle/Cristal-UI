import { h } from '@stencil/core';
import { ChartSeries, niceTicks, valuesOf } from './chart-scale';
import { Tooltip } from './chart-parts';

interface PlotProps {
  type: 'column' | 'line' | 'area';
  labels: string[];
  series: ChartSeries[];
  width: number;
  height: number;
  active?: number;
  value: (value: number) => string;
  tick: (value: number) => string;
  onActive: (index: number) => void;
}

const CHAR = 7; // largeur moyenne d'un caractère des graduations (12 px), pour réserver la place des textes
const GAP = 2;

/** Colonne arrondie (4 px) du côté de la valeur, carrée sur la ligne de base. */
const columnPath = (x: number, w: number, base: number, end: number) => {
  const r = Math.min(4, w / 2, Math.abs(base - end));
  const s = end < base ? 1 : -1;
  return `M${x} ${base}V${end + s * r}Q${x} ${end} ${x + r} ${end}H${x + w - r}Q${x + w} ${end} ${x + w} ${end + s * r}V${base}Z`;
};

const fixed = (n: number) => n.toFixed(1);

/** Colonnes groupées, ou courbes (avec surface pour area), sur une seule échelle verticale. */
export const Plot = ({ type, labels, series, width, height, active, value, tick, onActive }: PlotProps) => {
  const all = valuesOf(series);
  const ticks = niceTicks(Math.min(...all), Math.max(...all));
  const lone = type !== 'column' && series.length === 1 && all.length > 0;
  const endText = lone ? value(series[0].values[labels.length - 1] ?? 0) : '';
  const left = Math.max(...ticks.map((t) => tick(t).length)) * CHAR + 12;
  const right = 8 + endText.length * CHAR;
  const top = 12;
  const plotW = Math.max(1, width - left - right);
  const plotH = Math.max(1, height - top - 28);
  const [t0, tN] = [ticks[0], ticks[ticks.length - 1]];
  const y = (v: number) => top + plotH * (1 - (v - t0) / (tN - t0));
  const n = labels.length;
  const band = plotW / Math.max(1, n);
  const step = type === 'column' || n < 2 ? band : plotW / (n - 1);
  const x = (i: number) => (type === 'column' || n < 2 ? left + band * (i + 0.5) : left + step * i);
  const every = Math.ceil((Math.max(...labels.map((l) => l.length)) * CHAR + 12) / step);
  const groupW = Math.min(band * 0.72, series.length * 24 + (series.length - 1) * GAP);
  const barW = (groupW - (series.length - 1) * GAP) / series.length;
  const line = (s: ChartSeries) => s.values.map((v, i) => `${i ? 'L' : 'M'}${fixed(x(i))} ${fixed(y(v))}`).join('');
  return (
    <div class="plot-area">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {ticks.map((t) => [
          <line class={t === 0 ? 'baseline' : 'grid'} x1={left} x2={left + plotW} y1={fixed(y(t))} y2={fixed(y(t))} />,
          <text class="tick" x={left - 8} y={fixed(y(t))} text-anchor="end" dominant-baseline="middle">
            {tick(t)}
          </text>,
        ])}
        {labels.map((label, i) =>
          i !== active && (i % every || (active !== undefined && Math.abs(i - active) < every)) ? null : (
            <text class={{ tick: true, on: i === active }} x={fixed(x(i))} y={height - 8} text-anchor={type === 'column' || n < 2 ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {label}
            </text>
          ),
        )}
        {type !== 'column' && active !== undefined && <line class="crosshair" x1={fixed(x(active))} x2={fixed(x(active))} y1={top} y2={top + plotH} />}
        {series.map((s, j) =>
          type === 'column' ? (
            <g class={`series s${j + 1}`}>
              {s.values.map((v, i) => (
                <path class={{ column: true, dim: active !== undefined && i !== active }} d={columnPath(x(i) - groupW / 2 + j * (barW + GAP), barW, y(0), y(v))} />
              ))}
            </g>
          ) : (
            <g class={`series s${j + 1}`}>
              {type === 'area' && <path class="area" d={`${line(s)}L${fixed(x(n - 1))} ${fixed(y(0))}L${fixed(x(0))} ${fixed(y(0))}Z`} />}
              <path class="line" d={line(s)} pathLength="1" />
              {active !== undefined && <circle class="dot" cx={fixed(x(active))} cy={fixed(y(s.values[active] ?? 0))} r="4" />}
              {lone && active === undefined && <circle class="dot end" cx={fixed(x(n - 1))} cy={fixed(y(s.values[n - 1] ?? 0))} r="4" />}
            </g>
          ),
        )}
        {lone && (
          <text class="end-label" x={fixed(x(n - 1) + 8)} y={fixed(y(series[0].values[n - 1] ?? 0))} dominant-baseline="middle">
            {endText}
          </text>
        )}
        {labels.map((_, i) => (
          <rect class="hit" x={fixed(x(i) - step / 2)} y={top} width={fixed(step)} height={plotH} onPointerEnter={() => onActive(i)} />
        ))}
      </svg>
      {active !== undefined && <Tooltip x={x(active)} y={top} width={width} title={labels[active]} series={series} index={active} value={value} />}
    </div>
  );
};
