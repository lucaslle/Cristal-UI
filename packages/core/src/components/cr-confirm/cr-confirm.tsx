import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Confirmation en une ligne : le bouton d'une action à risque se change, sur place, en « Supprimer ce fichier ? Supprimer · Annuler ».
 * Plus léger qu'une modale pour une action qu'on peut regretter mais qui ne mérite pas d'interrompre la page.
 * Le focus va sur Annuler ; Échap, Annuler ou un focus qui part ailleurs rendent le bouton d'origine.
 * @slot - Le bouton qui déclenche l'action : cr-button, cr-icon-button ou bouton natif.
 * @part question - La question.
 * @part confirm - Le bouton qui confirme.
 * @part cancel - Le bouton qui annule.
 */
@Component({
  tag: 'cr-confirm',
  styleUrl: 'cr-confirm.css',
  shadow: true,
})
export class CrConfirm {
  @Element() el!: HTMLCrConfirmElement;

  /** Question posée à la place du bouton, courte et précise : « Supprimer ce fichier ? » (obligatoire). */
  @Prop() question!: string;
  /** Libellé du bouton qui confirme, le verbe de l'action (« Supprimer ») ; « Confirmer » par défaut. */
  @Prop() confirmLabel?: string;
  /** Libellé du bouton qui annule ; « Annuler » par défaut. */
  @Prop() cancelLabel?: string;

  /** Émis quand l'utilisateur confirme : c'est là que l'action s'exécute. */
  @Event() crConfirm: EventEmitter<void>;

  /** La question est posée. */
  @State() asking = false;

  private cancel?: HTMLElement;

  componentDidUpdate() {
    if (this.asking && !this.el.shadowRoot?.activeElement) this.cancel?.focus();
  }

  private trigger = () => this.el.querySelector<HTMLElement>(':scope > *');

  private ask = (event: MouseEvent) => {
    if (this.asking || this.trigger()?.hasAttribute('disabled')) return;
    event.stopPropagation();
    this.asking = true;
  };

  private answer(confirmed: boolean) {
    this.asking = false;
    // Le bouton d'origine reparaît : le focus y revient, comme à la fermeture d'une modale.
    requestAnimationFrame(() => this.trigger()?.focus());
    if (confirmed) this.crConfirm.emit();
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this.asking) return;
    // Dans une modale, Échap annule la question sans fermer la modale.
    event.preventDefault();
    event.stopPropagation();
    this.answer(false);
  };

  private onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (this.asking && next && !this.el.contains(next) && !this.el.shadowRoot?.contains(next)) this.asking = false;
  };

  render() {
    const m = t(this.el);
    return (
      <Host onKeyDown={this.onKeyDown} onFocusout={this.onFocusOut}>
        <span class="trigger" hidden={this.asking} onClick={this.ask}>
          <slot />
        </span>
        <span class="row" role="group" aria-labelledby="question" hidden={!this.asking}>
          <span id="question" class="question" part="question">
            {this.question}
          </span>
          <cr-button size="s" part="confirm" onClick={() => this.answer(true)}>
            {this.confirmLabel ?? m.confirm}
          </cr-button>
          <cr-button size="s" variant="secondary" part="cancel" ref={(el) => (this.cancel = el)} onClick={() => this.answer(false)}>
            {this.cancelLabel ?? m.cancel}
          </cr-button>
        </span>
      </Host>
    );
  }
}
