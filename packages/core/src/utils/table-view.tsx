import { h } from '@stencil/core';
import { PopupPanel } from './popup-view';
import type { Messages } from './i18n';
import { ColumnState, TableDensity, summary } from './table-layout';

interface ToolbarProps {
  m: Messages;
  label: string;
  state: ColumnState[];
  labelOf: (key: string) => string;
  density: TableDensity;
  menuOpen: boolean;
  buttonRef: (el: HTMLButtonElement) => void;
  panelRef: (el: HTMLElement) => void;
  onMenu: () => void;
  onMenuKey: (event: KeyboardEvent) => void;
  onHidden: (key: string, hidden: boolean) => void;
  onDensity: (density: TableDensity) => void;
  onReset: () => void;
}

export const Toolbar = (props: ToolbarProps) => {
  const shown = props.state.filter((column) => !column.hidden).length;
  return (
    <div class="toolbar">
      <span id="title" class="title">
        {props.label}
      </span>
      <div class="tools">
        <button ref={props.buttonRef} class="tool" type="button" aria-expanded={props.menuOpen ? 'true' : 'false'} aria-controls="columns" onClick={props.onMenu} onKeyDown={props.onMenuKey}>
          {props.m.columns}
          <span class="count">
            {shown}/{props.state.length}
          </span>
        </button>
        <PopupPanel panelRef={props.panelRef} part="columns" animation="fade">
          <div id="columns" class="choices" role="group" aria-label={props.m.columnsShown} onKeyDown={props.onMenuKey}>
            {props.state.map((column) => (
              <label class="choice">
                <input
                  type="checkbox"
                  checked={!column.hidden}
                  disabled={!column.hidden && shown === 1}
                  onChange={(event) => props.onHidden(column.key, !(event.target as HTMLInputElement).checked)}
                />
                {props.labelOf(column.key)}
                {column.pinned && <span class="badge">{props.m.pinned}</span>}
              </label>
            ))}
          </div>
        </PopupPanel>
        <div class="density" role="radiogroup" aria-label={props.m.rowDensity}>
          {(Object.keys(props.m.densities) as TableDensity[]).map((density) => (
            <label class={{ segment: true, on: density === props.density }}>
              <input type="radio" name="density" checked={density === props.density} onChange={() => props.onDensity(density)} />
              {props.m.densities[density]}
            </label>
          ))}
        </div>
        <button class="tool" type="button" onClick={props.onReset}>
          {props.m.reset}
        </button>
      </div>
    </div>
  );
};

export const Footer = ({ state, density, sortable, m }: { state: ColumnState[]; density: TableDensity; sortable: boolean; m: Messages }) => {
  const help = m.tableHelp;
  return (
    <div class="footer">
      <p class="status">{summary(state, density, m)}</p>
      <p id="help" class="help">
        {help.onHeader} <kbd>←</kbd> <kbd>→</kbd> {help.neighbour} · <kbd>Alt</kbd> + <kbd>←</kbd> <kbd>→</kbd> {help.move} · <kbd>{help.shift}</kbd> + <kbd>←</kbd> <kbd>→</kbd> {help.width} ·{' '}
        <kbd>F</kbd> {help.pin} · <kbd>M</kbd> {help.hide} · <kbd>{help.enter}</kbd> {help.fit}
        {sortable && [' · ', <kbd>S</kbd>, ` ${help.sort}`]}
      </p>
    </div>
  );
};

export const Pin = ({ m }: { m: Messages }) => [
  <svg class="pin" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
  </svg>,
  <span class="sr-only">, {m.pinned}</span>,
];
