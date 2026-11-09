import { h } from '@stencil/core';
import { PopupPanel } from './popup-view';
import { ColumnState, TableDensity, summary } from './table-layout';

const DENSITY_LABELS: Record<TableDensity, string> = { comfortable: 'Confortable', normal: 'Normale', compact: 'Compacte' };

interface ToolbarProps {
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
          Colonnes
          <span class="count">
            {shown}/{props.state.length}
          </span>
        </button>
        <PopupPanel panelRef={props.panelRef} part="columns" animation="fade">
          <div id="columns" class="choices" role="group" aria-label="Colonnes affichées" onKeyDown={props.onMenuKey}>
            {props.state.map((column) => (
              <label class="choice">
                <input
                  type="checkbox"
                  checked={!column.hidden}
                  disabled={!column.hidden && shown === 1}
                  onChange={(event) => props.onHidden(column.key, !(event.target as HTMLInputElement).checked)}
                />
                {props.labelOf(column.key)}
                {column.pinned && <span class="badge">fixée</span>}
              </label>
            ))}
          </div>
        </PopupPanel>
        <div class="density" role="radiogroup" aria-label="Densité des lignes">
          {(Object.keys(DENSITY_LABELS) as TableDensity[]).map((density) => (
            <label class={{ segment: true, on: density === props.density }}>
              <input type="radio" name="density" checked={density === props.density} onChange={() => props.onDensity(density)} />
              {DENSITY_LABELS[density]}
            </label>
          ))}
        </div>
        <button class="tool" type="button" onClick={props.onReset}>
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export const Footer = ({ state, density }: { state: ColumnState[]; density: TableDensity }) => (
  <div class="footer">
    <p class="status">{summary(state, density)}</p>
    <p id="help" class="help">
      Sur un en-tête : <kbd>←</kbd> <kbd>→</kbd> colonne voisine · <kbd>Alt</kbd> + <kbd>←</kbd> <kbd>→</kbd> déplacer · <kbd>Maj</kbd> + <kbd>←</kbd> <kbd>→</kbd>{' '}
      largeur · <kbd>F</kbd> fixer · <kbd>M</kbd> masquer · <kbd>Entrée</kbd> ajuster
    </p>
  </div>
);

export const Pin = () => [
  <svg class="pin" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
  </svg>,
  <span class="sr-only">, fixée</span>,
];
