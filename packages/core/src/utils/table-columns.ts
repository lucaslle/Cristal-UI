import type { EventEmitter } from '@stencil/core';
import { t } from './i18n';
import { headerAction } from './table-keys';
import { applyAction } from './table-actions';
import { ColumnState, TableColumn, TableDensity, TableLayout, mergeState, moveTo, neighbour, resize, saveLayout } from './table-layout';
import { columnLefts, dragColumn, dragResize, fitWidth, flipColumns } from './table-pointer';

/** Ce que le contrôleur lit et modifie sur cr-table. */
export interface ColumnsHost {
  el: HTMLElement;
  columns: TableColumn[];
  storageKey?: string;
  state: ColumnState[];
  density: TableDensity;
  message: string;
  crLayoutChange: EventEmitter<TableLayout>;
}

/** Réglages des colonnes au clavier et au pointeur : déplacer, redimensionner, fixer, masquer, ajuster. */
export class TableColumns {
  table?: HTMLTableElement;
  indicator?: HTMLElement;
  initialDensity: TableDensity = 'normal';
  private lefts?: Map<string, number>;
  private focusKey?: string;

  constructor(private host: ColumnsHost) {}

  labelOf = (key: string) => this.host.columns.find((column) => column.key === key)?.label ?? key;
  private header = (key: string) => this.table?.querySelector<HTMLElement>(`th[data-key="${CSS.escape(key)}"]`);

  /** À appeler après chaque rendu : anime les colonnes déplacées et rend le focus. */
  afterRender() {
    if (this.lefts && this.table) flipColumns(this.table, this.lefts);
    if (this.focusKey) this.header(this.focusKey)?.focus();
    this.lefts = this.focusKey = undefined;
  }

  commit(next: ColumnState[], message: string, animate = false) {
    if (animate) this.lefts = columnLefts(this.table);
    this.host.state = next;
    this.host.message = message;
    this.changed();
  }

  changed() {
    const layout = { columns: this.host.state, density: this.host.density };
    saveLayout(this.host.storageKey, layout);
    this.host.crLayoutChange.emit(layout);
  }

  /** Raccourcis d'en-tête ; renvoie true si la touche a été traitée. `sort` gère la touche S. */
  onKey(event: KeyboardEvent, key: string, sort?: () => void) {
    const action = headerAction(event);
    if (!action || (action.type === 'sort' && !sort)) return;
    event.preventDefault();
    if (action.type === 'sort') return sort?.();
    const state = this.host.state;
    const visible = state.filter((c) => !c.hidden);
    if (action.type === 'focus') {
      const to = action.to === 'first' ? visible[0]?.key : action.to === 'last' ? visible[visible.length - 1]?.key : neighbour(state, key, action.to);
      return to && this.header(to)?.focus();
    }
    const result = applyAction(action, state, key, this.labelOf(key), () => (this.table ? fitWidth(this.table, key) : 160), t(this.host.el));
    this.focusKey = result.focus;
    this.commit(result.next, result.message, result.animate);
  }

  startDrag(event: PointerEvent, column: ColumnState) {
    if (!this.table || !this.indicator) return;
    const candidates = this.host.state.filter((c) => !c.hidden && c.pinned === column.pinned).map((c) => c.key);
    dragColumn({
      event,
      key: column.key,
      table: this.table,
      indicator: this.indicator,
      candidates,
      onDrop: (target) => {
        const next = moveTo(this.host.state, column.key, target);
        const position = next.filter((c) => !c.hidden).findIndex((c) => c.key === column.key) + 1;
        this.commit(next, t(this.host.el).columnMoved(this.labelOf(column.key), position), true);
      },
    });
  }

  startResize(event: PointerEvent, column: ColumnState) {
    const width = () => this.host.state.find((c) => c.key === column.key)!.width;
    dragResize(event, column.width, (next) => (this.host.state = resize(this.host.state, column.key, next)), () => this.commit(this.host.state, t(this.host.el).columnWidth(this.labelOf(column.key), width())));
  }

  fit(key: string) {
    if (this.table) this.commit(resize(this.host.state, key, fitWidth(this.table, key)), t(this.host.el).columnFitted(this.labelOf(key)));
  }

  reset = () => {
    this.host.density = this.initialDensity;
    this.commit(mergeState(this.host.columns), t(this.host.el).columnsReset, true);
    saveLayout(this.host.storageKey, null);
  };
}
