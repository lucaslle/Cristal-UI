import { h } from '@stencil/core';
import { CellValue, SelectCell } from './table-cells';
import type { Messages } from './i18n';
import type { ColumnState, TableColumn } from './table-layout';

/** Lignes ajoutées à chaque fois : un grand tableau s'affiche vite et se complète pendant le défilement. */
export const CHUNK = 100;

type Row = Record<string, unknown>;

interface RowsProps {
  rows: Row[];
  limit: number;
  visible: ColumnState[];
  cell: (column: ColumnState) => Record<string, unknown>;
  meta: Map<string, TableColumn>;
  idOf: (row: Row, index: number) => string;
  onOpen: (row: Row) => void;
  /** Absent quand le tableau n'est pas selectable. */
  selection?: { ids: Set<string>; labelOf: (row: Row) => string; onToggle: (id: string) => void };
}

const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [tabindex], [role="button"], [role="menuitem"]';

/** Un clic sur la ligne vaut un clic sur son bouton, sauf sur un élément interactif ou en sélectionnant du texte. */
const rowClick = (event: MouseEvent, onOpen: () => void) => {
  for (const node of event.composedPath()) {
    if (node === event.currentTarget) break;
    if (node instanceof Element && node.matches(INTERACTIVE)) return;
  }
  if (!getSelection()?.toString()) onOpen();
};

export const Rows = ({ rows, limit, visible, cell, meta, idOf, onOpen, selection }: RowsProps) => {
  const clickable = visible.some((column) => meta.get(column.key)?.primary);
  return rows.slice(0, limit).map((row, index) => {
    const id = idOf(row, index);
    const selected = !!selection?.ids.has(id);
    return (
      <tr aria-rowindex={index + 2} class={{ selected, clickable }} onClick={clickable ? (event) => rowClick(event, () => onOpen(row)) : undefined}>
        {selection && <SelectCell checked={selected} label={selection.labelOf(row)} onChange={() => selection.onToggle(id)} />}
        {visible.map((column) => {
          const info = meta.get(column.key);
          return <td {...cell(column)}>{info?.slot ? <slot name={`${column.key}-${id}`} /> : <CellValue row={row} meta={info} onOpen={() => onOpen(row)} />}</td>;
        })}
      </tr>
    );
  });
};

export const More = ({ shown, total, moreRef, m }: { shown: number; total: number; moreRef: (el?: HTMLElement) => void; m: Messages }) =>
  shown < total ? (
    <p ref={moreRef} class="more">
      {m.moreRows(shown.toLocaleString(m.locale), total.toLocaleString(m.locale))}
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
