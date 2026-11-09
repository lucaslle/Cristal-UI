import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

/**
 * Carte d'un cr-dashboard. Se déplace par sa poignée et se redimensionne par son coin.
 * Donnez-lui un id pour retrouver sa place dans les réglages enregistrés.
 * @slot - Le contenu.
 * @slot actions - Boutons placés dans l'en-tête.
 * @part handle - La poignée de déplacement.
 * @part resize - La poignée de redimensionnement.
 */
@Component({
  tag: 'cr-widget',
  styleUrl: 'cr-widget.css',
  shadow: true,
})
export class CrWidget {
  @Element() el!: HTMLElement;

  /** Titre affiché dans l'en-tête. */
  @Prop() label!: string;
  /** Colonne de départ (à partir de 0) ; sans valeur, le widget prend la première place libre. */
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
  /** Ajoute un bouton × qui émet crRemove. */
  @Prop() removable = false;

  /** Émis par le bouton × : retirez alors le widget de votre liste. */
  @Event() crRemove: EventEmitter<void>;
  /** Interne : prévient le tableau de bord qu'une position ou une taille a changé. */
  @Event({ eventName: 'crWidgetUpdate' }) crWidgetUpdate: EventEmitter<void>;

  @Watch('x')
  @Watch('y')
  @Watch('w')
  @Watch('h')
  @Watch('label')
  changed() {
    this.crWidgetUpdate.emit();
  }

  render() {
    return (
      <Host role="group" aria-label={this.label}>
        <div class="card">
          <div class="head">
            <button class="handle" part="handle" type="button" aria-label={`Déplacer ${this.label}`} aria-description="Flèches : déplacer. Maj + flèches : changer la taille.">
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
              <button class="remove" type="button" aria-label={`Retirer ${this.label}`} onClick={() => this.crRemove.emit()}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div class="body">
            <slot />
          </div>
          <span class="resize" part="resize" aria-hidden="true" />
        </div>
      </Host>
    );
  }
}
