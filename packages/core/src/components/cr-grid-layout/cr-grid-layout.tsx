import { Component, Element, Event, EventEmitter, Host, Listen, Method, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { holdStill, onControl, onScrollbar, rectsOf, settle, slide, track } from '../../utils/grid-drag';
import { GridLayoutItem, describe, itemOf, keyLayout, loadItems, plain, saveItems } from '../../utils/grid-keys';
import { GridItem, moveItem, placeAll, resizeItem, sameLayout, updateItem } from '../../utils/grid-layout';
import { GridOverlay } from '../../utils/grid-overlay';

/**
 * Grille déplaçable : des éléments cr-grid-item que l'utilisateur déplace (poignée ou carte entière) et redimensionne par leur coin ou leurs bords.
 * Les autres éléments s'écartent pendant le déplacement, puis tout se tasse vers le haut.
 * @slot - Les éléments cr-grid-item.
 */
@Component({
  tag: 'cr-grid-layout',
  styleUrl: 'cr-grid-layout.css',
  shadow: true,
})
export class CrGridLayout {
  @Element() el!: HTMLElement;

  /** Nombre de colonnes de la grille. */
  @Prop() columns = 12;
  /** Hauteur d'une ligne, en pixels. */
  @Prop() rowHeight = 80;
  /** Espace entre les éléments, en pixels. */
  @Prop() gap = 16;
  /** Permet de déplacer et de redimensionner les éléments. */
  @Prop() editable = true;
  /** Où attraper une carte à la souris : n'importe où (`surface`), après un appui maintenu (`hold`, le texte reste sélectionnable) ou par la poignée seule (`handle`). */
  @Prop({ reflect: true }) grab: 'surface' | 'hold' | 'handle' = 'surface';
  /** Nom de la grille, lu par les lecteurs d’écran (« Grid », ou « Grille » en français, par défaut). */
  @Prop() label?: string;
  /** Largeur (px) sous laquelle les éléments s'empilent sur toute la largeur, sans poignées. */
  @Prop() stackBelow = 480;
  /** Clé localStorage : la disposition de l'utilisateur est retenue d'une visite à l'autre. */
  @Prop() storageKey?: string;

  /** Émis après chaque déplacement ou redimensionnement ; detail : id, x, y, w, h de chaque élément. */
  @Event() crLayoutChange: EventEmitter<GridLayoutItem[]>;

  @State() layout: GridItem[] = [];
  @State() ghost?: GridItem;
  @State() message = '';

  private initial?: GridItem[];

  private widgets = () => Array.from(this.el.children).filter((child): child is HTMLCrGridItemElement => child.tagName === 'CR-GRID-ITEM');
  private idOf = (widget: Element) => widget.id || `item-${this.widgets().indexOf(widget as HTMLCrGridItemElement)}`;

  private fromProps = (widget: HTMLCrGridItemElement) => itemOf(widget, this.idOf(widget), this.columns);

  /** Met la grille en accord avec les éléments présents : garde les places connues, place les nouveaux. */
  private sync = (fresh = false) => {
    const known: GridLayoutItem[] = fresh ? loadItems(this.storageKey) : this.layout;
    const props = this.widgets().map(this.fromProps);
    if (fresh) this.initial = placeAll(props, this.columns);
    this.apply(placeAll(props.map((item) => ({ ...item, ...known.find((k) => k.id === item.id) })), this.columns), undefined, !fresh);
  };

  componentDidLoad() {
    this.sync(true);
  }

  /** Applique une disposition : place chaque élément dans la grille, les autres glissent jusqu'à leur nouvelle place. */
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
    const items = plain(this.layout);
    saveItems(this.storageKey, items);
    this.crLayoutChange.emit(items);
  }

  /** Revient à la disposition de départ et oublie celle enregistrée. */
  @Method()
  async reset() {
    if (this.initial) this.apply(this.initial);
    saveItems(this.storageKey, null);
    this.message = t(this.el).layoutReset;
    this.crLayoutChange.emit(plain(this.layout));
  }

  @Listen('crGridItemUpdate')
  onGridItemUpdate(event: Event) {
    const widget = event.target as HTMLCrGridItemElement;
    if (widget.parentElement !== this.el || !this.layout.length) return;
    this.apply(updateItem(this.layout, this.fromProps(widget), this.columns));
  }

  private grid?: HTMLElement;

  @Listen('pointerdown', { passive: false })
  onPointerDown(event: PointerEvent) {
    const path = event.composedPath() as HTMLElement[];
    const widget = path.find((el) => el.tagName === 'CR-GRID-ITEM' && el.parentElement === this.el) as HTMLCrGridItemElement | undefined;
    if (!widget || !this.editable || this.narrow || event.button !== 0) return;
    const part = path.find((el) => el.getAttribute?.('part') === 'handle' || el.getAttribute?.('part') === 'resize');
    if (part) return this.drag(event, widget, part, part.dataset.axis ?? '');
    // Au doigt, la poignée seule, pour garder le défilement de la page.
    if (this.grab === 'handle' || event.pointerType === 'touch' || onControl(path, widget) || onScrollbar(event)) return;
    if (this.grab === 'surface') return this.drag(event, widget, widget, '');
    holdStill(event, () => {
      getSelection()?.removeAllRanges();
      document.documentElement.style.userSelect = 'none';
      widget.toggleAttribute('data-lifted', true);
      this.drag(event, widget, widget, '');
    });
  }

  private drag(event: PointerEvent, widget: HTMLCrGridItemElement, target: HTMLElement, axis: string) {
    if (!this.grid) return;
    const id = this.idOf(widget);
    const base = this.layout;
    const origin = base.find((i) => i.id === id)!;
    const stepX = (this.grid.clientWidth + this.gap) / this.columns;
    const stepY = this.rowHeight + this.gap;
    track(
      event,
      target,
      (dx, dy) => {
        widget.toggleAttribute('data-lifted', true);
        const next = axis
          ? resizeItem(base, id, Math.round(origin.w + (axis.includes('x') ? dx / stepX : 0)), Math.round(origin.h + (axis.includes('y') ? dy / stepY : 0)), this.columns)
          : moveItem(base, id, Math.round(origin.x + dx / stepX), Math.round(origin.y + dy / stepY), this.columns);
        const placed = next.find((i) => i.id === id)!;
        if (!axis) widget.style.translate = `${(origin.x - placed.x) * stepX + dx}px ${(origin.y - placed.y) * stepY + dy}px`;
        if (!sameLayout(next, this.layout)) this.apply(next, widget);
        this.ghost = placed;
      },
      (moved) => {
        widget.removeAttribute('data-lifted');
        document.documentElement.style.userSelect = '';
        settle(widget);
        this.ghost = undefined;
        if (moved) this.commit(describe(this.layout.find((i) => i.id === id)!, widget.label, !!axis, t(this.el)));
      },
    );
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const path = event.composedPath() as HTMLElement[];
    const widget = path.find((el) => el.tagName === 'CR-GRID-ITEM' && el.parentElement === this.el) as HTMLCrGridItemElement | undefined;
    if (!this.editable || this.narrow || !widget || path[0]?.getAttribute?.('part') !== 'handle') return;
    const change = keyLayout(event, this.layout, this.idOf(widget), this.columns);
    if (!change) return;
    event.preventDefault();
    const item = change.next.find((i) => i.id === this.idOf(widget))!;
    if (!sameLayout(change.next, this.layout)) this.apply(change.next);
    this.commit(describe(item, widget.label, change.resize, t(this.el)));
  }

  render() {
    return (
      <Host>
        <div ref={(el) => (this.grid = el)} class={{ grid: true, dragging: !!this.ghost }} role="group" aria-label={this.label ?? t(this.el).grid} style={{ '--cols': `${this.columns}`, '--row': `${this.rowHeight}px`, '--gap': `${this.gap}px` }}>
          <GridOverlay ghost={this.ghost} layout={this.layout} columns={this.columns} />
          <slot onSlotchange={() => this.layout.length && this.sync()} />
        </div>
        <p class="sr-only" role="status">
          {this.message}
        </p>
      </Host>
    );
  }
}
