import { Build, Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Popup, createPopup } from '../../utils/popup';
import { headerAction } from '../../utils/table-keys';
import { applyAction } from '../../utils/table-actions';
import { cellProps } from '../../utils/table-cells';
import { CHUNK, More, Rows, watchMore } from '../../utils/table-rows';
import { ColumnState, DENSITIES, TableColumn, TableDensity, TableLayout, TableVariant, loadLayout, mergeState, moveTo, neighbour, pinOffsets, resize, saveLayout, setHidden } from '../../utils/table-layout';
import { columnLefts, dragColumn, dragResize, fitWidth, flipColumns } from '../../utils/table-pointer';
import { Footer, Pin, Toolbar } from '../../utils/table-view';

/**
 * Tableau dont chaque utilisateur règle les colonnes : largeur, ordre, colonnes fixées et masquées, densité des lignes.
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
  /** Colonnes : key, label, width (px, 160 par défaut), align ('start' ou 'end'), pinned, hidden. */
  @Prop() columns: TableColumn[] = [];
  /** Lignes : un objet par ligne, avec une valeur par clé de colonne. */
  @Prop() rows: Record<string, unknown>[] = [];
  /** Style : default, striped (lignes alternées), cards (lignes en cartes), minimal ou grid (façon tableur). */
  @Prop() variant: TableVariant = 'default';
  /** Hauteur des lignes. */
  @Prop({ mutable: true }) density: TableDensity = 'normal';
  /** Clé localStorage : les réglages de l'utilisateur sont retenus d'une visite à l'autre. */
  @Prop() storageKey?: string;

  /** Émis à chaque réglage ; detail : les colonnes (ordre, largeur, fixée, masquée) et la densité. */
  @Event() crLayoutChange: EventEmitter<TableLayout>;

  @State() state: ColumnState[] = [];
  @State() menuOpen = false;
  @State() message = '';
  @State() scrolled = false;
  @State() active?: string;
  @State() limit = CHUNK; // lignes affichées, augmente pendant le défilement

  private table?: HTMLTableElement;
  private indicator?: HTMLElement;
  private menuButton?: HTMLButtonElement;
  private panel?: HTMLElement;
  private popup?: Popup;
  private lefts?: Map<string, number>;
  private focusKey?: string;
  private initialDensity: TableDensity = 'normal';
  private restored = false;
  private more?: HTMLElement;
  private observer?: IntersectionObserver;

  componentWillLoad() {
    this.initialDensity = this.density;
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

  @Watch('rows')
  rowsChanged() { this.limit = CHUNK; }

  disconnectedCallback() {
    this.popup?.destroy();
    this.observer?.disconnect();
  }

  componentDidRender() {
    if (!this.popup && this.panel && this.menuButton)
      this.popup = createPopup({ popup: this.panel, anchor: this.menuButton, host: this.el, onOpen: () => (this.menuOpen = true), onClose: () => (this.menuOpen = false) });
    this.observer = watchMore(this.observer, this.more, () => (this.limit += CHUNK));
    if (this.lefts && this.table) flipColumns(this.table, this.lefts);
    this.lefts = undefined;
    if (this.focusKey) this.header(this.focusKey)?.focus();
    this.focusKey = undefined;
  }

  private labelOf = (key: string) => this.columns.find((column) => column.key === key)?.label ?? key;
  private header = (key: string) => this.table?.querySelector<HTMLElement>(`th[data-key="${CSS.escape(key)}"]`);

  private commit(next: ColumnState[], message: string, animate = false) {
    if (animate) this.lefts = columnLefts(this.table);
    this.state = next;
    this.message = message;
    this.changed();
  }

  private changed() {
    const layout = { columns: this.state, density: this.density };
    saveLayout(this.storageKey, layout);
    this.crLayoutChange.emit(layout);
  }

  private onHeaderKey(event: KeyboardEvent, { key }: ColumnState) {
    const action = headerAction(event);
    if (!action) return;
    event.preventDefault();
    const visible = this.state.filter((c) => !c.hidden);
    if (action.type === 'focus') {
      const to = action.to === 'first' ? visible[0]?.key : action.to === 'last' ? visible[visible.length - 1]?.key : neighbour(this.state, key, action.to);
      return to && this.header(to)?.focus();
    }
    const result = applyAction(action, this.state, key, this.labelOf(key), () => (this.table ? fitWidth(this.table, key) : 160));
    this.focusKey = result.focus;
    this.commit(result.next, result.message, result.animate);
  }

  private startDrag(event: PointerEvent, column: ColumnState) {
    if (!this.table || !this.indicator) return;
    const candidates = this.state.filter((c) => !c.hidden && c.pinned === column.pinned).map((c) => c.key);
    dragColumn({
      event,
      key: column.key,
      table: this.table,
      indicator: this.indicator,
      candidates,
      onDrop: (target) => {
        const next = moveTo(this.state, column.key, target);
        const position = next.filter((c) => !c.hidden).findIndex((c) => c.key === column.key) + 1;
        this.commit(next, `${this.labelOf(column.key)} déplacée en position ${position}.`, true);
      },
    });
  }

  private startResize(event: PointerEvent, column: ColumnState) {
    dragResize(event, column.width, (width) => (this.state = resize(this.state, column.key, width)), () => this.commit(this.state, `${this.labelOf(column.key)} : ${this.state.find((c) => c.key === column.key)!.width} pixels.`));
  }

  private reset = () => {
    this.density = this.initialDensity;
    this.commit(mergeState(this.columns), 'Colonnes réinitialisées.', true);
    saveLayout(this.storageKey, null);
  };

  render() {
    const visible = this.state.filter((c) => !c.hidden);
    const offsets = pinOffsets(this.state);
    const lastPinned = Array.from(offsets.keys()).pop();
    const meta = new Map(this.columns.map((c) => [c.key, c]));
    const active = visible.some((c) => c.key === this.active) ? this.active : visible[0]?.key;
    const cell = (c: ColumnState) => cellProps(c, meta.get(c.key), offsets, lastPinned);
    return (
      <Host data-density={this.density} data-variant={this.variant}>
        <Toolbar
          {...{ label: this.label, state: this.state, labelOf: this.labelOf, density: this.density, menuOpen: this.menuOpen }}
          buttonRef={(el) => (this.menuButton = el)}
          panelRef={(el) => (this.panel = el)}
          onMenu={() => (this.popup?.isOpen() ? this.popup.close() : this.popup?.open())}
          onMenuKey={(event) => event.key === 'Escape' && (this.popup?.close(), this.menuButton?.focus())}
          onHidden={(key, hidden) => this.commit(setHidden(this.state, key, hidden), `${this.labelOf(key)} ${hidden ? 'masquée' : 'affichée'}.`, true)}
          onDensity={(density) => ((this.density = density), (this.message = `Lignes ${DENSITIES[density]}.`), this.changed())}
          onReset={this.reset}
        />
        <div class={{ scroll: true, scrolled: this.scrolled }} onScroll={(event) => (this.scrolled = (event.target as HTMLElement).scrollLeft > 0)}>
          <table ref={(el) => (this.table = el)} aria-labelledby="title" aria-rowcount={this.rows.length + 1} style={{ width: `${visible.reduce((sum, c) => sum + c.width, 0)}px` }}>
            <colgroup>
              {visible.map((c) => (
                <col style={{ width: `${c.width}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr aria-rowindex={1}>
                {visible.map((c) => (
                  <th scope="col" {...cell(c)} tabIndex={c.key === active ? 0 : -1} aria-describedby="help" onFocus={() => (this.active = c.key)} onKeyDown={(e) => this.onHeaderKey(e, c)} onPointerDown={(e) => this.startDrag(e, c)}>
                    <span class="text">{this.labelOf(c.key)}</span>
                    {c.pinned && <Pin />}
                    <span class="handle" aria-hidden="true" onPointerDown={(e) => this.startResize(e, c)} onDblClick={() => this.table && this.commit(resize(this.state, c.key, fitWidth(this.table, c.key)), `${this.labelOf(c.key)} ajustée.`)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Rows rows={this.rows} limit={this.limit} visible={visible} cell={cell} meta={meta} />
            </tbody>
          </table>
          <span ref={(el) => (this.indicator = el)} class="drop" hidden aria-hidden="true" />
          <More shown={Math.min(this.limit, this.rows.length)} total={this.rows.length} moreRef={(el) => (this.more = el)} />
        </div>
        <Footer state={this.state} density={this.density} />
        <p class="sr-only" role="status">
          {this.message}
        </p>
      </Host>
    );
  }
}
