import { Build, Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { ToastIcon } from '../../utils/toast';

// Un bandeau déjà là au chargement ne se déplie pas : la page sauterait à l'hydratation.
const initial = new WeakSet<Element>(typeof document !== 'undefined' ? Array.from(document.querySelectorAll('cr-alert')) : []);

/**
 * Bandeau de message dans la page : information, réussite, avertissement ou erreur, avec un titre facultatif.
 * Inséré après le chargement de la page, il se déplie ; son icône se trace ; avec dismissible, un bouton Fermer le replie.
 * @slot - Le message.
 * @part alert - La boîte du bandeau.
 * @part heading - Le titre.
 * @part close - Le bouton Fermer.
 */
@Component({
  tag: 'cr-alert',
  styleUrl: 'cr-alert.css',
  shadow: true,
})
export class CrAlert {
  @Element() el!: HTMLCrAlertElement;

  /** Type de message : info, success (réussite), warning (avertissement) ou danger (erreur, lue aussitôt par les lecteurs d'écran). */
  @Prop({ reflect: true }) variant: 'info' | 'success' | 'warning' | 'danger' = 'info';
  /** Titre affiché en gras au-dessus du message. */
  @Prop() heading?: string;
  /** Ajoute un bouton Fermer qui replie et masque le bandeau. */
  @Prop() dismissible = false;

  /** Émis quand le bouton Fermer a masqué le bandeau. */
  @Event() crClose: EventEmitter<void>;

  @State() closed = false;

  private enter = false;

  componentWillLoad() {
    this.enter = Build.isBrowser && document.readyState === 'complete' && !initial.has(this.el);
  }

  private close = async () => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await this.el.animate({ gridTemplateRows: ['1fr', '0fr'] }, { duration: 250, easing: 'ease-in' }).finished.catch(() => undefined);
    }
    this.closed = true;
    this.crClose.emit();
  };

  render() {
    const m = t(this.el);
    return (
      <Host hidden={this.closed} data-enter={this.enter ? '' : undefined}>
        <div class="clip">
          <div class="alert" part="alert">
            <ToastIcon variant={this.variant} />
            <div class="content" role={this.variant === 'danger' ? 'alert' : 'status'}>
              <span class="sr-only">{m.alertPrefix[this.variant]}</span>
              {this.heading && (
                <strong class="heading" part="heading">
                  {this.heading}
                </strong>
              )}
              <slot />
            </div>
            {this.dismissible && (
              <button type="button" class="close" part="close" aria-label={m.close} onClick={this.close}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
