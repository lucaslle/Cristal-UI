import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';
import { Popup, createPopup } from '../../utils/popup';

/**
 * Fenêtre contextuelle : petit panneau non modal ouvert par un bouton, pour du contenu interactif (formulaire court, réglages…).
 * Le focus entre dans le panneau à l'ouverture et revient au bouton à la fermeture (Échap, clic à l'extérieur, bouton).
 * @slot - Le contenu du panneau.
 * @part trigger - Le bouton qui ouvre le panneau.
 * @part panel - Le panneau.
 */
@Component({
  tag: 'cr-popover',
  styleUrls: ['../../global/popup.css', '../cr-menu/cr-menu.css', 'cr-popover.css'],
  shadow: true,
})
export class CrPopover {
  @Element() el!: HTMLCrPopoverElement;

  /** Libellé du bouton, qui nomme aussi le panneau pour les lecteurs d'écran (obligatoire). */
  @Prop() label!: string;
  /** Panneau ouvert ; à remettre à false pour le fermer après une action (« Appliquer »). */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Désactive le bouton. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand l'utilisateur ouvre ou ferme le panneau ; detail : l'état ouvert. */
  @Event() crToggle: EventEmitter<boolean>;

  private trigger?: HTMLButtonElement;
  private panel?: HTMLElement;
  private popup?: Popup;

  @Watch('open')
  openChanged(open: boolean) {
    if (open) this.popup?.open();
    else this.popup?.close();
  }

  componentDidLoad() {
    this.popup = createPopup({
      popup: this.panel!,
      anchor: this.trigger!,
      host: this.el,
      onOpen: () => this.sync(true),
      onClose: () => {
        // Le panneau va disparaître : le focus qu'il contenait revient au bouton.
        if (document.activeElement && this.el.contains(document.activeElement)) this.trigger?.focus();
        this.sync(false);
      },
    });
    if (this.open) this.popup.open();
  }

  disconnectedCallback() {
    this.popup?.destroy();
  }

  private sync(open: boolean) {
    if (this.open === open) return;
    this.open = open;
    this.crToggle.emit(open);
  }

  // Premier élément du contenu qui accepte le focus, y compris un composant qui le délègue à son shadow DOM ; sinon le panneau.
  private focusFirst() {
    const before = document.activeElement;
    for (const candidate of Array.from(this.el.querySelectorAll<HTMLElement>('*'))) {
      candidate.focus();
      if (document.activeElement !== before) return;
    }
    this.panel?.focus();
  }

  private onTriggerClick = () => {
    if (this.popup?.isOpen()) return this.popup.close();
    this.popup?.open();
    this.focusFirst();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !this.popup?.isOpen()) return;
    event.preventDefault();
    event.stopPropagation();
    this.popup.close();
  };

  // Écouté sur l'hôte : un focus qui reste dans le bouton ou le contenu a pour cible relative l'hôte ou l'un de ses enfants.
  private onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && !this.el.contains(next)) this.popup?.close();
  };

  render() {
    return (
      <Host onKeyDown={this.onKeyDown} onFocusout={this.onFocusOut}>
        <button
          ref={(el) => (this.trigger = el)}
          id="trigger"
          class="menu-trigger"
          part="trigger"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={this.open ? 'true' : 'false'}
          aria-controls="panel"
          disabled={this.disabled}
          onClick={this.onTriggerClick}
        >
          <span>{this.label}</span>
          <svg class="chevron" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div ref={(el) => (this.panel = el)} id="panel" class="popup panel" part="panel" popover="manual" role="dialog" aria-labelledby="trigger" tabindex="-1">
          <slot />
        </div>
      </Host>
    );
  }
}
