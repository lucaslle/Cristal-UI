import type { Messages } from './i18n';
import { GridItem, moveItem, resizeItem } from './grid-layout';

const STEPS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

/** Flèches : déplacer d'une case ; Maj + flèches : une colonne ou une ligne de plus ou de moins. */
export const keyLayout = (event: KeyboardEvent, layout: GridItem[], id: string, columns: number) => {
  const step = STEPS[event.key];
  const item = layout.find((i) => i.id === id);
  if (!step || !item || event.altKey || event.ctrlKey || event.metaKey) return undefined;
  const [dx, dy] = step;
  return event.shiftKey ? { resize: true, next: resizeItem(layout, id, item.w + dx, item.h + dy, columns) } : { resize: false, next: moveItem(layout, id, item.x + dx, item.y + dy, columns) };
};

export const describe = (item: GridItem, label: string, resize: boolean, m: Messages) =>
  resize ? m.itemResized(label, item.w, item.h) : m.itemMoved(label, item.x + 1, item.y + 1);

export interface GridLayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const loadItems = (storageKey?: string): GridLayoutItem[] => {
  if (!storageKey) return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  } catch {
    return [];
  }
};

export const saveItems = (storageKey: string | undefined, items: GridLayoutItem[] | null) => {
  if (!storageKey) return;
  try {
    if (items) localStorage.setItem(storageKey, JSON.stringify(items));
    else localStorage.removeItem(storageKey);
  } catch {
    // Stockage indisponible (navigation privée) : la disposition vaut pour la session.
  }
};

export const plain = (layout: GridItem[]): GridLayoutItem[] => layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }));

/** Position et taille déclarées sur un cr-grid-item (x et y à -1 : première place libre). */
export const itemOf = (widget: HTMLCrGridItemElement, id: string, columns: number): GridItem => ({
  id,
  x: widget.x ?? -1,
  y: widget.y ?? -1,
  w: Math.min(widget.w ?? 3, columns),
  h: widget.h ?? 2,
  minW: widget.minW ?? 1,
  minH: widget.minH ?? 1,
  maxW: widget.maxW ?? columns,
  maxH: widget.maxH ?? 12,
});
