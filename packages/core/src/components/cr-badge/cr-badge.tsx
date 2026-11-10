import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { countUp } from '../../utils/segmented-segments';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'danger';

/**
 * Pastille : court statut ou compteur (« Payée », « Non lus 3 »). Le texte porte le sens, la couleur ne fait que l'appuyer.
 * Quand count change, le nombre défile jusqu'à sa nouvelle valeur, comme un compteur kilométrique.
 * @slot - Le texte de la pastille.
 * @part badge - La pastille.
 * @part count - Le nombre.
 */
@Component({
  tag: 'cr-badge',
  styleUrl: 'cr-badge.css',
  shadow: true,
})
export class CrBadge {
  /** Couleur : neutral (gris), primary, success, danger. */
  @Prop({ reflect: true }) variant: BadgeVariant = 'neutral';
  /** Nombre affiché après le texte ; il défile jusqu'à chaque nouvelle valeur. */
  @Prop() count?: number;
  /** Annonce poliment chaque changement aux lecteurs d'écran (zone role="status") ; désactivé par défaut. */
  @Prop() live = false;

  /** Nombre affiché pendant le défilement. */
  @State() shown?: number;
  @State() direction?: 'up' | 'down';

  private stopCount?: () => void;

  disconnectedCallback() {
    this.stopCount?.();
  }

  @Watch('count')
  countChanged(next?: number, previous?: number) {
    this.stopCount?.();
    this.shown = undefined;
    if (next == null || previous == null || next === previous) return;
    this.direction = next > previous ? 'up' : 'down';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.shown = previous;
    this.stopCount = countUp(next, (value) => (this.shown = value === undefined ? undefined : Math.round(value)), previous);
  }

  render() {
    const counted = this.count != null;
    const value = this.shown ?? this.count;
    return (
      <Host role={this.live ? 'status' : undefined}>
        <span class="badge" part="badge">
          <slot />
          {counted && (
            <span class="count" part="count">
              {/* Les chiffres qui défilent sont pour les yeux ; les lecteurs d'écran lisent le nombre final. */}
              <span key={value} class="digits" data-direction={this.direction} aria-hidden="true">
                {value}
              </span>
              <span class="sr-only">{this.count}</span>
            </span>
          )}
        </span>
      </Host>
    );
  }
}
