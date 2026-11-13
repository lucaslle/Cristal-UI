import { h } from '@stencil/core';
import { ColumnState, TableColumn } from './table-layout';

/** Largeur de la colonne des cases à cocher (prop selectable). */
export const SELECT_WIDTH = 48;

/** Attributs communs à l'en-tête et aux cellules d'une colonne. */
export const cellProps = (column: ColumnState, meta: TableColumn | undefined, offsets: Map<string, number>, lastPinned?: string) => ({
  'data-key': column.key,
  class: { pinned: column.pinned, 'pinned-last': column.key === lastPinned, end: meta?.align === 'end' },
  style: column.pinned ? { left: `${offsets.get(column.key)}px` } : {},
});

export const textOf = (row: Record<string, unknown>, meta?: TableColumn) => (meta?.format ? meta.format(row[meta.key], row) : String(row[meta?.key ?? ''] ?? ''));

interface CellProps {
  row: Record<string, unknown>;
  meta?: TableColumn;
  onOpen: () => void;
}

/** Contenu d'une cellule : texte, pastille colorée si la colonne associe un ton à cette valeur, ou bouton de la ligne (primary). */
export const CellValue = ({ row, meta, onOpen }: CellProps) => {
  const text = textOf(row, meta);
  const tone = meta?.badges?.[text];
  if (meta?.primary)
    return (
      <button type="button" class="text open" onClick={onOpen}>
        {text}
      </button>
    );
  return <span class={tone ? `text chip ${tone}` : 'text'}>{text}</span>;
};

interface CheckProps {
  head?: boolean;
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: () => void;
}

/** Case de sélection, dans une cellule collée à gauche. */
export const SelectCell = ({ head, checked, indeterminate, label, onChange }: CheckProps) => {
  const box = <input type="checkbox" checked={checked} indeterminate={indeterminate} aria-label={label} onChange={onChange} />;
  return head ? (
    <th class="select" scope="col">
      {box}
    </th>
  ) : (
    <td class="select">{box}</td>
  );
};
