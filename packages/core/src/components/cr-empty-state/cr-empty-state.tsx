import { Component, Element, Prop, h } from '@stencil/core';
import { illustrations } from '../../utils/illustrations';

/**
 * État vide : ce qui s'affiche quand une liste, une recherche ou une page n'a rien à montrer, avec de quoi en sortir.
 * L'illustration flotte doucement trois fois, puis s'arrête.
 * @slot - La description : pourquoi c'est vide, et quoi faire.
 * @slot actions - Les boutons pour sortir de l'état vide.
 * @part illustration - L'illustration.
 * @part heading - Le titre.
 * @part description - La zone de la description.
 * @part actions - La zone des boutons.
 */
@Component({
  tag: 'cr-empty-state',
  styleUrl: 'cr-empty-state.css',
  shadow: true,
})
export class CrEmptyState {
  @Element() el!: HTMLCrEmptyStateElement;

  /** Titre court, en gras : ce qui manque (« Aucune commande »). */
  @Prop() heading!: string;
  /** Illustration décorative : none (aucune), search (loupe, aucun résultat), inbox (boîte vide) ou error (erreur). */
  @Prop({ reflect: true }) illustration: 'none' | 'search' | 'inbox' | 'error' = 'none';

  render() {
    const Illustration = this.illustration !== 'none' && illustrations[this.illustration];
    return (
      <div class="empty-state">
        {Illustration && (
          <div class="illustration" part="illustration">
            <Illustration />
          </div>
        )}
        <p class="heading" part="heading">
          {this.heading}
        </p>
        <div class="description" part="description">
          <slot />
        </div>
        {this.el.querySelector(':scope > [slot="actions"]') && (
          <div class="actions" part="actions">
            <slot name="actions" />
          </div>
        )}
      </div>
    );
  }
}
