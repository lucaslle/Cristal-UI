import { AttachInternals, Component, Host, Prop, h } from '@stencil/core';
import { Control } from '../../utils/button-control';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';
export type ButtonSize = 'xs' | 's' | 'm' | 'l';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Bouton d'action.
 * @slot - Libellé du bouton.
 * @slot start - Icône avant le libellé.
 * @slot end - Icône après le libellé.
 * @part button - Le bouton natif, ou le lien natif avec href.
 * @part spinner - L'indicateur de chargement.
 */
@Component({
  tag: 'cr-button',
  styleUrl: 'cr-button.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrButton {
  @AttachInternals() internals: ElementInternals;

  /** Niveau de hiérarchie visuelle. */
  @Prop({ reflect: true }) variant: ButtonVariant = 'primary';
  /** Hauteur : xs 30px, s 36px, m 40px, l 48px. */
  @Prop({ reflect: true }) size: ButtonSize = 'm';
  /** Comportement dans un formulaire (sans effet avec href). */
  @Prop() type: ButtonType = 'button';
  /** Adresse : le bouton devient un vrai lien (Ctrl+clic, clic molette et « Ouvrir dans un nouvel onglet » natifs). */
  @Prop() href?: string;
  /** Où ouvrir le lien (avec href), par exemple _blank ; rel="noopener noreferrer" est ajouté pour _blank. */
  @Prop() target?: string;
  /** Désactive le bouton. */
  @Prop({ reflect: true }) disabled = false;
  /** Affiche l'indicateur de chargement et bloque les clics. */
  @Prop({ reflect: true }) loading = false;
  /** Occupe toute la largeur du conteneur. */
  @Prop({ reflect: true }) fullWidth = false;

  private handleClick = (event: MouseEvent) => {
    if (this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.href !== undefined) return;
    const form = this.internals.form;
    if (this.type === 'submit') form?.requestSubmit();
    if (this.type === 'reset') form?.reset();
  };

  render() {
    return (
      <Host onClick={this.handleClick}>
        <Control part="button" href={this.href} target={this.target} disabled={this.disabled} loading={this.loading}>
          {this.loading && <span class="spinner" part="spinner" aria-hidden="true" />}
          <slot name="start" />
          <span class="label">
            <slot />
          </span>
          <slot name="end" />
        </Control>
      </Host>
    );
  }
}
