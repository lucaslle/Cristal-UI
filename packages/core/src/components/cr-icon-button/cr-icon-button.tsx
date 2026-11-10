import { AttachInternals, Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Control } from '../../utils/button-control';
import type { ButtonSize, ButtonType } from '../cr-button/cr-button';

export type IconButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';

const pop = (el: Element | null | undefined, scale: number) => {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.animate({ transform: ['scale(1)', `scale(${scale})`, 'scale(1)'] }, { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' });
};

/**
 * Bouton réduit à une icône. Le libellé lui donne son nom et s'affiche en infobulle au survol et au focus.
 * @slot - L'icône, avec aria-hidden="true".
 * @part button - Le bouton natif.
 * @part tooltip - L'infobulle.
 * @part badge - La pastille.
 */
@Component({
  tag: 'cr-icon-button',
  styleUrls: ['../cr-button/cr-button.css', '../../global/tooltip.css', 'cr-icon-button.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrIconButton {
  @AttachInternals() internals: ElementInternals;

  /** Nom du bouton, lu par les lecteurs d'écran et affiché dans l'infobulle (obligatoire). */
  @Prop() label!: string;
  /** Niveau de hiérarchie visuelle ; ghost : sans fond, pour les barres d'outils. */
  @Prop({ reflect: true }) variant: IconButtonVariant = 'ghost';
  /** Côté : xs 30px, s 36px, m 40px, l 48px. */
  @Prop({ reflect: true }) size: ButtonSize = 'm';
  /** Coins arrondis (square) ou bouton rond (round). */
  @Prop({ reflect: true }) shape: 'square' | 'round' = 'square';
  /** Comportement dans un formulaire (sans effet avec href). */
  @Prop() type: ButtonType = 'button';
  /** Adresse : le bouton devient un vrai lien (Ctrl+clic, clic molette et « Ouvrir dans un nouvel onglet » natifs). */
  @Prop() href?: string;
  /** Où ouvrir le lien (avec href), par exemple _blank ; rel="noopener noreferrer" est ajouté pour _blank. */
  @Prop() target?: string;
  /** Désactive le bouton. */
  @Prop({ reflect: true }) disabled = false;
  /** Remplace l'icône par l'indicateur de chargement et bloque les clics. */
  @Prop({ reflect: true }) loading = false;
  /** Bouton bascule (favori, muet…) : chaque clic inverse pressed, annoncé enfoncé ou non. */
  @Prop() toggle = false;
  /** État de la bascule (avec toggle). */
  @Prop({ mutable: true, reflect: true }) pressed = false;
  /** Pastille (nombre de notifications…), ajoutée au nom lu : « Notifications (3) ». */
  @Prop() badge?: string | number;
  /** Affiche le libellé en infobulle au survol et au focus. */
  @Prop() tooltip = true;
  /** Côté où s'ouvre l'infobulle. */
  @Prop() tooltipPlacement: TooltipPlacement = 'top';

  /** Émis quand l'utilisateur inverse la bascule ; detail : le nouvel état pressed. */
  @Event() crToggle: EventEmitter<boolean>;

  /** Infobulle masquée avec Échap, jusqu'à ce que le pointeur ou le focus quitte le bouton. */
  @State() dismissed = false;

  private button?: HTMLElement;
  private icon?: HTMLElement;
  private pill?: HTMLElement;

  // React redonne la pastille après le chargement (nombre au lieu du texte de l'attribut) : seul un vrai changement s'anime.
  @Watch('badge')
  badgeChanged(next?: string | number, previous?: string | number) {
    if (previous != null && `${previous}` !== '' && `${next}` !== `${previous}`) pop(this.pill, 1.35);
  }

  private handleClick = (event: MouseEvent) => {
    // Un clic sur l'infobulle (qui reste survolable) n'est pas un clic sur le bouton.
    if (this.loading || this.disabled || !event.composedPath().includes(this.button!)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle) {
      this.pressed = !this.pressed;
      pop(this.icon, 1.25);
      this.crToggle.emit(this.pressed);
    }
    if (this.href !== undefined) return;
    const form = this.internals.form;
    if (this.type === 'submit') form?.requestSubmit();
    if (this.type === 'reset') form?.reset();
  };

  private reset = () => (this.dismissed = false);

  render() {
    const counted = this.badge !== undefined && this.badge !== '';
    return (
      <Host
        onClick={this.handleClick}
        onKeyDown={(event: KeyboardEvent) => event.key === 'Escape' && (this.dismissed = true)}
        onPointerLeave={this.reset}
        onFocusout={this.reset}
      >
        <Control
          ref={(el: HTMLElement) => (this.button = el)}
          part="button"
          href={this.href}
          target={this.target}
          disabled={this.disabled}
          loading={this.loading}
          aria-label={counted ? `${this.label} (${this.badge})` : this.label}
          aria-pressed={this.toggle && this.href === undefined ? String(this.pressed) : undefined}
        >
          {this.loading && <span class="spinner" part="spinner" aria-hidden="true" />}
          <span class="icon" ref={(el) => (this.icon = el)} hidden={this.loading}>
            <slot />
          </span>
        </Control>
        {counted && (
          <span class="badge" part="badge" aria-hidden="true" ref={(el) => (this.pill = el)}>
            {this.badge}
          </span>
        )}
        {this.tooltip && (
          <span class="tooltip" part="tooltip" aria-hidden="true" data-placement={this.tooltipPlacement} data-dismissed={this.dismissed ? '' : undefined}>
            {this.label}
          </span>
        )}
      </Host>
    );
  }
}
