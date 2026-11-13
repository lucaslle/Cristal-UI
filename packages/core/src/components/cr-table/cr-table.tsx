import { Build, Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Popup, createPopup } from '../../utils/popup';
import { SELECT_WIDTH, SelectCell, cellProps, textOf } from '../../utils/table-cells';
import { TableColumns } from '../../utils/table-columns';
import { HeaderCell } from '../../utils/table-head';
import { selectionOf } from '../../utils/table-selection';
import { TableSort, nextSort, sortCache } from '../../utils/table-sort';
import { CHUNK, More, Rows, watchMore } from '../../utils/table-rows';
import { t } from '../../utils/i18n';
import { ColumnState, TableColumn, TableDensity, TableLayout, TableVariant, loadLayout, mergeState, pinOffsets, setHidden } from '../../utils/table-layout';
import { Footer, Toolbar } from '../../utils/table-view';

/**
 * Tableau dont chaque utilisateur règle les colonnes : largeur, ordre, colonnes fixées et masquées, densité des lignes.
 * Options : tri par colonne (sortable), cases de sélection (selectable), ligne cliquable (colonne primary),
 * cellules libres remplies par des enfants slot="<colonne>-<id>" (colonne slot).
 * @part columns - Le panneau « Colonnes ».
 */
@Component({
  tag: 'cr-table',
  styleUrls: ['../../global/popup.css', 'cr-table.css', 'table-tools.css', 'table-variants.css'],
  shadow: true,
})
export class CrTable {
  @Element() el!: HTMLElement;

  /** Titre du tableau. */
  @Prop() label!: string;
  /** Colonnes : key, label, width (px, 160 par défaut), align ('start' ou 'end'), pinned, hidden, badges, sortable, format, primary, slot. */
  @Prop() columns: TableColumn[] = [];
  /** Lignes : un objet par ligne, avec une valeur par clé de colonne. */
  @Prop() rows: Record<string, unknown>[] = [];
  /** Style : default, striped (lignes alternées), cards (lignes en cartes), minimal ou grid (façon tableur). */
  @Prop() variant: TableVariant = 'default';
  /** Hauteur des lignes. */
  @Prop({ mutable: true }) density: TableDensity = 'normal';
  /** Clé localStorage : les réglages de l'utilisateur sont retenus d'une visite à l'autre. */
  @Prop() storageKey?: string;
  /** Champ des lignes qui les identifie : sélection et cellules slot. */
  @Prop() rowKey = 'id';
  /** Ajoute une case à cocher par ligne et une case « tout sélectionner ». */
  @Prop() selectable = false;
  /** Lignes cochées : leurs valeurs de rowKey. */
  @Prop({ mutable: true }) selected: unknown[] = [];
  /** Tri en cours : { key, direction: 'ascending' | 'descending' } ; absent pour l'ordre d'origine. */
  @Prop({ mutable: true }) sort?: TableSort;

  /** Émis à chaque réglage ; detail : les colonnes (ordre, largeur, fixée, masquée) et la densité. */
  @Event() crLayoutChange: EventEmitter<TableLayout>;
  /** Émis au changement de tri ; detail : le tri, ou null pour l'ordre d'origine. */
  @Event() crSortChange: EventEmitter<TableSort | null>;
  /** Émis quand une case est cochée ou décochée ; detail : les valeurs de rowKey des lignes cochées. */
  @Event() crSelectionChange: EventEmitter<unknown[]>;
  /** Émis au clic sur la cellule primary ou ailleurs sur la ligne ; detail : la ligne. */
  @Event() crRowClick: EventEmitter<Record<string, unknown>>;

  @State() state: ColumnState[] = [];
  @State() menuOpen = false;
  @State() message = '';
  @State() scrolled = false;
  @State() active?: string;
  @State() limit = CHUNK; // lignes affichées, augmente pendant le défilement

  private cols = new TableColumns(this);
  private sortRows = sortCache();
  private menuButton?: HTMLButtonElement;
  private panel?: HTMLElement;
  private popup?: Popup;
  private restored = false;
  private more?: HTMLElement;
  private observer?: IntersectionObserver;
  private downX = 0;

  componentWillLoad() {
    this.cols.initialDensity = this.density;
    this.restore();
  }

  @Watch('columns')
  @Watch('storageKey')
  restore() {
    // React peut donner columns avant storageKey : on relit les réglages dès que les deux sont là.
    const saved = !this.restored && this.columns.length && Build.isBrowser ? loadLayout(this.storageKey) : undefined;
    if (saved) this.restored = true;
    if (saved?.density) this.density = saved.density;
    this.state = mergeState(this.columns, saved?.columns ?? this.state);
  }

  @Watch('rows') rowsChanged() { this.limit = CHUNK; }

  disconnectedCallback() {
    this.popup?.destroy();
    this.observer?.disconnect();
  }

  componentDidRender() {
    if (!this.popup && this.panel && this.menuButton)
      this.popup = createPopup({ popup: this.panel, anchor: this.menuButton, host: this.el, onOpen: () => (this.menuOpen = true), onClose: () => (this.menuOpen = false) });
    this.observer = watchMore(this.observer, this.more, () => (this.limit += CHUNK));
    this.cols.afterRender();
  }

  private toggleSort(key: string) {
    this.sort = nextSort(this.sort, key);
    this.message = t(this.el).sorted(this.cols.labelOf(key), this.sort?.direction);
    this.crSortChange.emit(this.sort ?? null);
  }

  private select(next: unknown[]) {
    this.selected = next;
    this.message = t(this.el).rowsSelected(next.length);
    this.crSelectionChange.emit(next);
  }

  render() {
    const { cols } = this;
    const visible = this.state.filter((c) => !c.hidden);
    const offsets = pinOffsets(this.state, this.selectable ? SELECT_WIDTH : 0);
    const lastPinned = Array.from(offsets.keys()).pop();
    const meta = new Map(this.columns.map((c) => [c.key, c]));
    const active = visible.some((c) => c.key === this.active) ? this.active : visible[0]?.key;
    const cell = (c: ColumnState) => cellProps(c, meta.get(c.key), offsets, lastPinned);
    const sortable = (key: string) => !!meta.get(key)?.sortable;
    const m = t(this.el);
    const picked = selectionOf(this.rows, this.selected, this.rowKey);
    const naming = meta.get(visible.find((c) => meta.get(c.key)?.primary)?.key ?? visible[0]?.key);
    return (
      <Host data-density={this.density} data-variant={this.variant}>
        <Toolbar
          {...{ m, label: this.label, state: this.state, labelOf: cols.labelOf, density: this.density, menuOpen: this.menuOpen }}
          buttonRef={(el) => (this.menuButton = el)}
          panelRef={(el) => (this.panel = el)}
          onMenu={() => (this.popup?.isOpen() ? this.popup.close() : this.popup?.open())}
          onMenuKey={(event) => event.key === 'Escape' && (this.popup?.close(), this.menuButton?.focus())}
          onHidden={(key, hidden) => cols.commit(setHidden(this.state, key, hidden), m.columnToggled(cols.labelOf(key), hidden), true)}
          onDensity={(density) => ((this.density = density), (this.message = m.densityMessage(m.densityRows[density])), cols.changed())}
          onReset={cols.reset}
        />
        <div class={{ scroll: true, scrolled: this.scrolled }} onScroll={(event) => (this.scrolled = (event.target as HTMLElement).scrollLeft > 0)}>
          <table ref={(el) => (cols.table = el)} aria-labelledby="title" aria-rowcount={this.rows.length + 1} style={{ width: `${visible.reduce((sum, c) => sum + c.width, this.selectable ? SELECT_WIDTH : 0)}px` }}>
            <colgroup>
              {this.selectable && <col style={{ width: `${SELECT_WIDTH}px` }} />}
              {visible.map((c) => (
                <col style={{ width: `${c.width}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr aria-rowindex={1}>
                {this.selectable && <SelectCell head checked={picked.all} indeterminate={picked.some} label={m.selectAll} onChange={() => this.select(picked.toggleAll())} />}
                {visible.map((c) => (
                  <HeaderCell
                    {...{ column: c, meta: meta.get(c.key), attributes: cell(c), active: c.key === active, sort: this.sort?.key === c.key ? this.sort.direction : undefined, m }}
                    onFocus={() => (this.active = c.key)}
                    onKeyDown={(e) => cols.onKey(e, c.key, sortable(c.key) ? () => this.toggleSort(c.key) : undefined)}
                    onPointerDown={(e) => ((this.downX = e.clientX), cols.startDrag(e, c))}
                    onClick={(e) => sortable(c.key) && Math.abs(e.clientX - this.downX) < 6 && this.toggleSort(c.key)}
                    onResize={(e) => cols.startResize(e, c)}
                    onFit={() => cols.fit(c.key)}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              <Rows
                {...{ rows: this.sortRows(this.rows, this.sort, m.locale), limit: this.limit, visible, cell, meta, idOf: picked.idOf }}
                onOpen={(row) => this.crRowClick.emit(row)}
                selection={this.selectable ? { ids: picked.ids, labelOf: (row) => m.selectRow(textOf(row, naming)), onToggle: (id) => this.select(picked.toggle(id)) } : undefined}
              />
            </tbody>
          </table>
          <span ref={(el) => (cols.indicator = el)} class="drop" hidden aria-hidden="true" />
          <More shown={Math.min(this.limit, this.rows.length)} total={this.rows.length} moreRef={(el) => (this.more = el)} m={m} />
        </div>
        <Footer state={this.state} density={this.density} sortable={this.columns.some((c) => c.sortable)} m={m} />
        <p class="sr-only" role="status">
          {this.message}
        </p>
      </Host>
    );
  }
}
