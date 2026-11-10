import { h } from '@stencil/core';
import { CellValue } from './table-cells';
import type { ColumnState, TableColumn } from './table-layout';

/** Lignes ajoutées à chaque fois : un grand tableau s'affiche vite et se complète pendant le défilement. */
export const CHUNK = 100;

interface RowsProps {
  rows: Record<string, unknown>[];
  limit: number;
  visible: ColumnState[];
  cell: (column: ColumnState) => Record<string, unknown>;
  meta: Map<string, TableColumn>;
}

export const Rows = ({ rows, limit, visible, cell, meta }: RowsProps) =>
  rows.slice(0, limit).map((row, index) => (
    <tr aria-rowindex={index + 2}>
      {visible.map((column) => (
        <td {...cell(column)}>
          <CellValue value={row[column.key]} meta={meta.get(column.key)} />
        </td>
      ))}
    </tr>
  ));

export const More = ({ shown, total, moreRef }: { shown: number; total: number; moreRef: (el?: HTMLElement) => void }) =>
  shown < total ? (
    <p ref={moreRef} class="more">
      {shown.toLocaleString('fr-FR')} lignes sur {total.toLocaleString('fr-FR')} : la suite s'affiche en défilant.
    </p>
  ) : null;

/** Appelle onMore quand l'élément approche de la zone visible ; à rappeler après chaque rendu. */
export const watchMore = (observer: IntersectionObserver | undefined, el: HTMLElement | undefined, onMore: () => void) => {
  if (typeof IntersectionObserver === 'undefined') return undefined;
  const watcher = observer ?? new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && onMore(), { rootMargin: '600px' });
  // Réobserver relance un premier relevé : si la marque est encore visible après l'ajout, on en ajoute encore.
  watcher.disconnect();
  if (el) watcher.observe(el);
  return watcher;
};
