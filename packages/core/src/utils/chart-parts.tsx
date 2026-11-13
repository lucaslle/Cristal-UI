import { h } from '@stencil/core';
import type { ChartSeries } from './chart-scale';
import type { Messages } from './i18n';

interface TooltipProps {
  x: number;
  y: number;
  width: number;
  title: string;
  series: ChartSeries[];
  index: number;
  value: (value: number) => string;
}

/** Bulle d'une catégorie : la valeur en avant, le nom de la série ensuite, repéré par un trait de sa couleur. */
export const Tooltip = ({ x, y, width, title, series, index, value }: TooltipProps) => (
  <div class={{ tooltip: true, flip: x > width / 2 }} style={{ left: `${x}px`, top: `${y}px` }} aria-hidden="true">
    <span class="tooltip-title">{title}</span>
    {series.map((s, j) => (
      <span class="tooltip-row">
        <span class={`key s${j + 1}`} />
        <strong>{value(s.values[index] ?? 0)}</strong>
        {series.length > 1 && <span class="tooltip-name">{s.name}</span>}
      </span>
    ))}
  </div>
);

/** Légende : toujours présente dès deux séries ; le repère reprend la forme de la marque (trait pour une courbe). */
export const Legend = ({ names, line }: { names: string[]; line?: boolean }) => (
  <ul class="legend">
    {names.map((name, j) => (
      <li>
        <span class={{ swatch: true, [`s${j + 1}`]: true, 'line-key': !!line }} aria-hidden="true" />
        {name}
      </li>
    ))}
  </ul>
);

interface TableProps {
  label: string;
  labels: string[];
  series: ChartSeries[];
  value: (value: number) => string;
  share?: (value: number) => string;
  m: Messages;
}

/** Les mêmes données en tableau : l'équivalent accessible du dessin. */
export const DataTable = ({ label, labels, series, value, share, m }: TableProps) => (
  <table class="data">
    <caption class="sr-only">{label}</caption>
    <thead>
      <tr>
        <th scope="col">{m.chartCategory}</th>
        {series.map((s) => (
          <th scope="col">{s.name}</th>
        ))}
        {share && <th scope="col">{m.chartShare}</th>}
      </tr>
    </thead>
    <tbody>
      {labels.map((name, i) => (
        <tr>
          <th scope="row">{name}</th>
          {series.map((s) => (
            <td>{value(s.values[i] ?? 0)}</td>
          ))}
          {share && <td>{share(series[0].values[i] ?? 0)}</td>}
        </tr>
      ))}
    </tbody>
  </table>
);
