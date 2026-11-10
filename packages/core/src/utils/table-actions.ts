import type { Messages } from './i18n';
import { HeaderAction } from './table-keys';
import { ColumnState, moveTo, neighbour, resize, setHidden, togglePin } from './table-layout';

export interface ActionResult {
  next: ColumnState[];
  message: string;
  focus: string;
  animate: boolean;
}

/** Applique un raccourci d'en-tête (hors déplacement du focus) et prépare le message annoncé. */
export const applyAction = (action: Exclude<HeaderAction, { type: 'focus' }>, state: ColumnState[], key: string, label: string, fit: () => number, m: Messages): ActionResult => {
  const column = state.find((c) => c.key === key)!;
  const shown = state.filter((c) => !c.hidden).length;
  if (action.type === 'move') {
    const next = moveTo(state, key, neighbour(state, key, action.step) ?? key);
    const position = next.filter((c) => !c.hidden).findIndex((c) => c.key === key) + 1;
    const message = next === state ? m.columnStuck(label) : m.columnMoved(label, position, shown);
    return { next, message, focus: key, animate: true };
  }
  if (action.type === 'pin') return { next: togglePin(state, key), message: m.columnPinned(label, !column.pinned), focus: key, animate: true };
  if (action.type === 'hide') {
    const next = setHidden(state, key, true);
    if (next === state) return { next, message: m.keepOneColumn, focus: key, animate: false };
    const focus = neighbour(state, key, 1) ?? neighbour(state, key, -1) ?? key;
    return { next, message: m.columnHidden(label, shown - 1, state.length), focus, animate: true };
  }
  const next = resize(state, key, action.type === 'fit' ? fit() : column.width + action.delta);
  return { next, message: m.columnWidth(label, next.find((c) => c.key === key)!.width), focus: key, animate: false };
};
