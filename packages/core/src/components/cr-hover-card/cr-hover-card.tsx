import { Component, Element, Host, Listen, Prop, State, h } from '@stencil/core';
import { followAnchor } from '../../utils/listbox';

/**
 * Carte au survol : aperçu d'un lien (profil, page, produit) qui s'ouvre quand le pointeur s'y attarde ou que le focus clavier y arrive.
 * On peut la survoler sans qu'elle se ferme ; Échap la ferme. C'est un aperçu : tout ce qu'elle montre doit aussi se trouver derrière le lien.
 * @slot - Le déclencheur, un lien en général.
 * @slot card - Le contenu de la carte, sans bouton ni lien (il ne serait pas atteignable au clavier).
 * @part card - La carte.
 */
@Component({
  tag: 'cr-hover-card',
  styleUrls: ['../../global/popup.css', 'cr-hover-card.css'],
  shadow: true,
})
export class CrHoverCard {
  @Element() el!: HTMLCrHoverCardElement;

  /** Délai avant l'ouverture au survol, en millisecondes : un simple passage du pointeur n'ouvre rien. */
  @Prop() openDelay = 500;

  @State() open = false;

  private anchor?: HTMLElement;
  private card?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private unfollow?: () => void;

  @Listen('keydown', { target: 'document' })
  onDocumentKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open) this.toggle(false);
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    this.unfollow?.();
  }

  private toggle(open: boolean) {
    clearTimeout(this.timer);
    if (open === this.open || !this.card || !this.anchor) return;
    this.open = open;
    this.unfollow?.();
    this.unfollow = undefined;
    if (!open) return this.card.hidePopover();
    this.card.showPopover();
    this.unfollow = followAnchor(this.card, this.anchor);
  }

  private later(open: boolean, delay: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toggle(open), delay);
  }

  // Au doigt, un appui suit le lien : la carte ne s'ouvre qu'à la souris, au stylet et au clavier.
  private onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') this.later(true, this.open ? 0 : this.openDelay);
  };

  private onPointerLeave = () => this.later(false, 300);

  private onFocusIn = (event: FocusEvent) => {
    if ((event.composedPath()[0] as Element).matches(':focus-visible')) this.toggle(true);
  };

  render() {
    return (
      <Host onFocusin={this.onFocusIn} onFocusout={() => this.toggle(false)}>
        <span class="anchor" ref={(el) => (this.anchor = el)} onPointerEnter={this.onPointerEnter} onPointerLeave={this.onPointerLeave}>
          <slot />
        </span>
        <div
          ref={(el) => (this.card = el)}
          class="popup card"
          part="card"
          popover="manual"
          data-state={this.open ? 'open' : undefined}
          onPointerEnter={this.onPointerEnter}
          onPointerLeave={this.onPointerLeave}
        >
          <slot name="card" />
        </div>
      </Host>
    );
  }
}
