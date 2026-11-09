import { h } from '@stencil/core';
import { ColumnState, TableColumn } from './table-layout';

/** Attributs communs à l'en-tête et aux cellules d'une colonne. */
export const cellProps = (column: ColumnState, meta: TableColumn | undefined, offsets: Map<string, number>, lastPinned?: string) => ({
  'data-key': column.key,
  class: { pinned: column.pinned, 'pinned-last': column.key === lastPinned, end: meta?.align === 'end' },
  style: column.pinned ? { left: `${offsets.get(column.key)}px` } : {},
});

/** Contenu d'une cellule : texte, ou pastille colorée si la colonne associe un ton à cette valeur. */
export const CellValue = ({ value, meta }: { value: unknown; meta?: TableColumn }) => {
  const text = String(value ?? '');
  const tone = meta?.badges?.[text];
  return <span class={tone ? `text chip ${tone}` : 'text'}>{text}</span>;
};
