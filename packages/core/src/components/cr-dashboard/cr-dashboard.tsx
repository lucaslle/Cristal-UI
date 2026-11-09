import { Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, h } from '@stencil/core';
import { rectsOf, settle, slide, track } from '../../utils/dashboard-drag';
import { DashboardItem, describe, keyLayout, loadItems, saveItems } from '../../utils/dashboard-keys';
import { GridItem, compact, firstFree, moveItem, resizeItem, rowsOf, sameLayout } from '../../utils/grid-layout';

/**
 * Tableau de bord : une grille de cr-widget que l'utilisateur déplace par leur poignée et redimensionne par leur coin.
 * Les autres widgets s'écartent pendant le déplacement, puis tout se tasse vers le haut.
 * @slot - Les widgets cr-widget.
 */
@Component({
  tag: 'cr-dashboard',
  styleUrl: 'cr-dashboard.css',
  shadow: true,
})
export class CrDashboard {
  @Element() el!: HTMLElement;

  /** Nombre de colonnes de la grille. */
  @Prop() columns = 12;
  /** Hauteur d'une ligne, en pixels. */
  @Prop() rowHeight = 80;
  /** Espace entre les widgets, en pixels. */
  @Prop() gap = 16;
  /** Permet de déplacer et de redimensionner les widgets. */
  @Prop() editable = true;
  /** Nom du tableau de bord, lu par les lecteurs d'écran. */
  @Prop() label = 'Tableau de bord';
  /** Largeur (px) sous laquelle les widgets s'empilent sur toute la largeur, sans poignées. */
  @Prop() stackBelow = 480;
  /** Clé localStorage : la disposition de l'utilisateur est retenue d'une visite à l'autre. */
  @Prop() storageKey?: string;

  /** Émis après chaque déplacement ou redimensionnement ; detail : id, x, y, w, h de chaque widget. */
  @Event() crLayoutChange: EventEmitter<DashboardItem[]>;

  @State() layout: GridItem[] = [];
  @State() ghost?: GridItem;
  @State() message = '';

  private initial?: GridItem[];

  private widgets = () => Array.from(this.el.children).filter((child): child is HTMLCrWidgetElement => child.tagName === 'CR-WIDGET');
  private idOf = (widget: Element) => widget.id || `widget-${this.widgets().indexOf(widget as HTMLCrWidgetElement)}`;

  private fromProps(widget: HTMLCrWidgetElement): GridItem {
    const max = this.columns;
    return { id: this.idOf(widget), x: widget.x ?? -1, y: widget.y ?? -1, w: Math.min(widget.w ?? 3, max), h: widget.h ?? 2, minW: widget.minW ?? 1, minH: widget.minH ?? 1, maxW: widget.maxW ?? max, maxH: widget.maxH ?? 12 };
  }

  /** Met la grille en accord avec les widgets présents : garde les places connues, place les nouveaux. */
  private sync = (fresh = false) => {
    const saved = fresh ? loadItems(this.storageKey) : [];
    let next: GridItem[] = [];
    for (const widget of this.widgets()) {
      const props = this.fromProps(widget);
      const known = fresh ? saved.find((s) => s.id === props.id) : this.layout.find((i) => i.id === props.id);
      const item = known ? { ...props, ...known } : props;
      next.push(item.x < 0 || item.y < 0 ? firstFree(next, item, this.columns) : item);
    }
    next = compact(next);
    if (fresh) this.initial = compact(this.widgets().map((w) => this.fromProps(w)).reduce<GridItem[]>((all, item) => [...all, item.x < 0 ? firstFree(all, item, this.columns) : item], []));
    this.apply(next, undefined, !fresh);
  };

  componentDidLoad() {
    this.sync(true);
  }

  /** Applique une disposition : place chaque widget dans la grille, les autres glissent jusqu'à leur nouvelle place. */
  private apply(next: GridItem[], dragged?: HTMLElement, animate = true) {
    const before = rectsOf(this.widgets());
    this.layout = next;
    for (const widget of this.widgets()) {
      const item = next.find((i) => i.id === this.idOf(widget));
      if (!item) continue;
      // Écran étroit : pleine largeur, empilés dans l'ordre de la grille.
      widget.style.gridColumn = this.narrow ? '1 / -1' : `${item.x + 1} / span ${item.w}`;
      widget.style.gridRow = this.narrow ? `auto / span ${item.h}` : `${item.y + 1} / span ${item.h}`;
      widget.style.order = this.narrow ? `${item.y * this.columns + item.x}` : '';
      widget.toggleAttribute('data-editable', this.editable && !this.narrow);
    }
    if (animate) slide(before, dragged);
  }

  private narrow = false;
  private resizeObserver?: ResizeObserver;

  connectedCallback() {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      const narrow = entry.contentRect.width < this.stackBelow;
      if (narrow === this.narrow) return;
      this.narrow = narrow;
      this.apply(this.layout, undefined, false);
    });
    this.resizeObserver.observe(this.el);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  private commit(message: string) {
    this.message = message;
    const items = this.layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }));
    saveItems(this.storageKey, items);
    this.crLayoutChange.emit(items);
  }

  /** Revient à la disposition de départ et oublie celle enregistrée. */
  @Method()
  async reset() {
    if (this.initial) this.apply(this.initial);
    saveItems(this.storageKey, null);
    this.message = 'Disposition d’origine rétablie.';
    this.crLayoutChange.emit(this.layout.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })));
  }

  @Listen('crWidgetUpdate')
  onWidgetUpdate(event: Event) {
    const widget = event.target as HTMLCrWidgetElement;
    if (widget.parentElement !== this.el || !this.layout.length) return;
    const props = this.fromProps(widget);
    const placed = this.layout.map((item) => (item.id === props.id ? { ...item, ...props, x: props.x < 0 ? item.x : props.x, y: props.y < 0 ? item.y : props.y } : item));
    const item = placed.find((i) => i.id === props.id)!;
    this.apply(resizeItem(moveItem(placed, item.id, item.x, item.y, this.columns), item.id, item.w, item.h, this.columns));
  }

  private grid?: HTMLElement;

  @Listen('pointerdown', { passive: false })
  onPointerDown(event: PointerEvent) {
    const path = event.composedPath() as HTMLElement[];
    const part = path.find((el) => el.getAttribute?.('part') === 'handle' || el.getAttribute?.('part') === 'resize');
    const widget = path.find((el) => el.tagName === 'CR-WIDGET' && el.parentElement === this.el);
    if (!part || !widget || !this.editable || !this.grid || this.narrow || event.button !== 0) return;
    const resize = part.getAttribute('part') === 'resize';
    const id = this.idOf(widget);
    const base = this.layout;
    const origin = base.find((i) => i.id === id)!;
    const stepX = (this.grid.clientWidth + this.gap) / this.columns;
    const stepY = this.rowHeight + this.gap;
    track(
      event,
      part,
      (dx, dy) => {
        widget.toggleAttribute('data-lifted', true);
        const next = resize
          ? resizeItem(base, id, Math.round(origin.w + dx / stepX), Math.round(origin.h + dy / stepY), this.columns)
          : moveItem(base, id, Math.round(origin.x + dx / stepX), Math.round(origin.y + dy / stepY), this.columns);
        const placed = next.find((i) => i.id === id)!;
        if (!resize) widget.style.translate = `${(origin.x - placed.x) * stepX + dx}px ${(origin.y - placed.y) * stepY + dy}px`;
        if (!sameLayout(next, this.layout)) this.apply(next, widget);
        this.ghost = placed;
      },
      (moved) => {
        widget.removeAttribute('data-lifted');
        settle(widget);
        this.ghost = undefined;
        const item = this.layout.find((i) => i.id === id)!;
        if (moved) this.commit(describe(item, (widget as HTMLCrWidgetElement).label, resize));
      },
    );
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const path = event.composedPath() as HTMLElement[];
    const widget = path.find((el) => el.tagName === 'CR-WIDGET' && el.parentElement === this.el) as HTMLCrWidgetElement | undefined;
    if (!this.editable || this.narrow || !widget || path[0]?.getAttribute?.('part') !== 'handle') return;
    const change = keyLayout(event, this.layout, this.idOf(widget), this.columns);
    if (!change) return;
    event.preventDefault();
    const item = change.next.find((i) => i.id === this.idOf(widget))!;
    if (!sameLayout(change.next, this.layout)) this.apply(change.next);
    this.commit(describe(item, widget.label, change.resize));
  }

  render() {
    const rows = rowsOf(this.layout) + (this.ghost ? 2 : 0);
    return (
      <Host>
        <div ref={(el) => (this.grid = el)} class={{ grid: true, dragging: !!this.ghost }} role="group" aria-label={this.label} style={{ '--cols': `${this.columns}`, '--row': `${this.rowHeight}px`, '--gap': `${this.gap}px` }}>
          {this.ghost &&
            Array.from({ length: this.columns * rows }, (_, i) => <span class="cell" aria-hidden="true" style={{ gridColumn: `${(i % this.columns) + 1}`, gridRow: `${Math.floor(i / this.columns) + 1}` }} />)}
          {this.ghost && <span class="ghost" aria-hidden="true" style={{ gridColumn: `${this.ghost.x + 1} / span ${this.ghost.w}`, gridRow: `${this.ghost.y + 1} / span ${this.ghost.h}` }} />}
          <slot onSlotchange={() => this.layout.length && this.sync()} />
        </div>
        <p class="sr-only" role="status">
          {this.message}
        </p>
      </Host>
    );
  }
}
