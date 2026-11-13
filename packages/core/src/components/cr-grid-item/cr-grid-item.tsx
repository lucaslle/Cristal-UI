import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Élément d'un cr-grid-layout. Se déplace par sa poignée ou sa surface et se redimensionne par son coin ou ses bords.
 * Donnez-lui un id pour retrouver sa place dans les réglages enregistrés.
 * @slot - Le contenu.
 * @slot actions - Boutons placés dans l'en-tête.
 * @part handle - La poignée de déplacement.
 * @part resize - Les poignées de redimensionnement.
 */
@Component({
  tag: 'cr-grid-item',
  styleUrls: ['cr-grid-item.css', 'cr-grid-item-variants.css', 'cr-grid-item-resize.css'],
  shadow: true,
})
export class CrGridItem {
  @Element() el!: HTMLElement;

  /** Titre affiché dans l'en-tête. */
  @Prop() label!: string;
  /** Colonne de départ (à partir de 0) ; sans valeur, l’élément prend la première place libre. */
  @Prop() x?: number;
  /** Ligne de départ (à partir de 0). */
  @Prop() y?: number;
  /** Largeur en colonnes. */
  @Prop() w = 3;
  /** Hauteur en lignes. */
  @Prop() h = 2;
  /** Largeur minimale en colonnes. */
  @Prop() minW = 1;
  /** Hauteur minimale en lignes. */
  @Prop() minH = 1;
  /** Largeur maximale en colonnes. */
  @Prop() maxW = 12;
  /** Hauteur maximale en lignes. */
  @Prop() maxH = 12;
  /** Apparence : carte bordée (`card`), ombrée (`elevated`), teintée (`soft`), simple contour (`outline`) ou verre dépoli (`glass`). */
  @Prop({ reflect: true }) variant: 'card' | 'elevated' | 'soft' | 'outline' | 'glass' = 'card';
  /** Poignée d'agrandissement : arc dans le coin (`corner`), pastille (`knob`) ou bords droit et bas en plus du coin (`edges`). */
  @Prop({ reflect: true }) resizeHandle: 'corner' | 'knob' | 'edges' = 'corner';
  /** Ajoute un bouton × qui émet crRemove. */
  @Prop() removable = false;

  /** Émis par le bouton × : retirez alors l’élément de votre liste. */
  @Event() crRemove: EventEmitter<void>;
  /** Interne : prévient le grille qu'une position ou une taille a changé. */
  @Event({ eventName: 'crGridItemUpdate' }) crGridItemUpdate: EventEmitter<void>;

  /** Contenu plus grand que la carte : le corps défile, et doit alors pouvoir recevoir le focus pour défiler au clavier. */
  @State() scrollable = false;

  private body?: HTMLElement;
  private sizes?: ResizeObserver;

  componentDidLoad() {
    if (typeof ResizeObserver === 'undefined' || !this.body) return;
    this.sizes = new ResizeObserver(this.measure);
    this.watchContent();
  }

  disconnectedCallback() {
    this.sizes?.disconnect();
  }

  private watchContent = () => {
    if (!this.sizes || !this.body) return;
    this.sizes.disconnect();
    this.sizes.observe(this.body);
    this.body.querySelector('slot')?.assignedElements().forEach((el) => this.sizes!.observe(el));
  };

  private measure = () => {
    const body = this.body!;
    this.scrollable = body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1;
  };

  @Watch('x')
  @Watch('y')
  @Watch('w')
  @Watch('h')
  @Watch('label')
  changed() {
    this.crGridItemUpdate.emit();
  }

  render() {
    return (
      <Host role="group" aria-label={this.label}>
        <div class="card">
          <div class="head">
            <button class="handle" part="handle" type="button" aria-label={t(this.el).itemMove(this.label)} aria-description={t(this.el).itemHelp}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="9" cy="6" r="1.6" />
                <circle cx="15" cy="6" r="1.6" />
                <circle cx="9" cy="12" r="1.6" />
                <circle cx="15" cy="12" r="1.6" />
                <circle cx="9" cy="18" r="1.6" />
                <circle cx="15" cy="18" r="1.6" />
              </svg>
            </button>
            <span class="title">
              {this.label}
            </span>
            <slot name="actions" />
            {this.removable && (
              <button class="remove" type="button" aria-label={t(this.el).itemRemove(this.label)} onClick={() => this.crRemove.emit()}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div ref={(el) => (this.body = el)} class="body" {...(this.scrollable ? { tabIndex: 0, role: 'region', 'aria-label': this.label } : {})}>
            <slot onSlotchange={this.watchContent} />
          </div>
          {/* data-axis : les sens que la poignée agrandit. */}
          {(this.resizeHandle === 'edges' ? ['x', 'y', 'xy'] : ['xy']).map((axis) => (
            <span class={`resize resize-${axis}`} part="resize" data-axis={axis} aria-hidden="true" />
          ))}
        </div>
      </Host>
    );
  }
}
