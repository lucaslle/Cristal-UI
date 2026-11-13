import { h } from '@stencil/core';
import type { Messages } from './i18n';
import type { ColumnState, TableColumn } from './table-layout';
import type { SortDirection } from './table-sort';
import { Pin } from './table-view';

interface HeaderProps {
  column: ColumnState;
  meta?: TableColumn;
  attributes: Record<string, any>;
  active: boolean;
  sort?: SortDirection;
  m: Messages;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onClick: (event: MouseEvent) => void;
  onResize: (event: PointerEvent) => void;
  onFit: () => void;
}

/** Flèche de tri : discrète tant que la colonne n'est pas triée. */
const SortIcon = ({ sort }: { sort?: SortDirection }) => (
  <svg class={{ sort: true, on: !!sort }} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    {sort !== 'descending' && <path d="M5 6.5 8 3.5l3 3" />}
    {sort !== 'ascending' && <path d="M5 9.5l3 3 3-3" />}
  </svg>
);

/** En-tête de colonne : déplaçable, redimensionnable et, si la colonne est sortable, cliquable pour trier. */
export const HeaderCell = (p: HeaderProps) => (
  <th
    scope="col"
    {...p.attributes}
    class={{ ...p.attributes.class, sortable: !!p.meta?.sortable }}
    tabIndex={p.active ? 0 : -1}
    aria-sort={p.sort}
    aria-describedby="help"
    onFocus={p.onFocus}
    onKeyDown={p.onKeyDown}
    onPointerDown={p.onPointerDown}
    onClick={p.onClick}
  >
    <span class="text">{p.meta?.label ?? p.column.key}</span>
    {p.meta?.sortable && <SortIcon sort={p.sort} />}
    {p.column.pinned && <Pin m={p.m} />}
    <span class="handle" aria-hidden="true" onPointerDown={p.onResize} onClick={(event) => event.stopPropagation()} onDblClick={p.onFit} />
  </th>
);
