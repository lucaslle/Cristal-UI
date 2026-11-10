import { Build, Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { AlertIcon, leave, swipe } from '../../utils/alert';

// Un bandeau déjà là au chargement ne se déplie pas : la page sauterait à l'hydratation.
const initial = new WeakSet<Element>(typeof document !== 'undefined' ? Array.from(document.querySelectorAll('cr-alert')) : []);

/**
 * Message d'information, de réussite, d'avertissement ou d'erreur, avec un titre facultatif ; son emplacement décide de son comportement.
 * Dans la page, c'est un bandeau : inséré après le chargement, il se déplie ; avec dismissible, un bouton Fermer le replie.
 * Dans un cr-toaster, c'est une notification : elle glisse depuis le coin et se ferme seule après duration, avec une barre du temps restant
 * qui s'arrête sous la souris ou le focus ; on la ferme aussi avec le bouton Fermer, Échap ou en la faisant glisser sur le côté.
 * Dans les deux cas, son icône se trace.
 * @slot - Le message.
 * @part alert - La boîte du message.
 * @part heading - Le titre.
 * @part close - Le bouton Fermer.
 * @part bar - La barre du temps restant, dans un cr-toaster.
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
  /** Ajoute un bouton Fermer qui replie et masque le bandeau. Dans un cr-toaster, le bouton est toujours là. */
  @Prop() dismissible = false;
  /** Affiche le message ; à false, il se ferme (replié dans la page, glissé hors du coin dans un cr-toaster). Chaque fermeture le remet à false. */
  @Prop({ mutable: true, reflect: true }) open = true;
  /** Dans un cr-toaster : durée d'affichage en millisecondes avant la fermeture automatique ; 0 : le message reste jusqu'à ce qu'on le ferme. Sans effet dans la page. */
  @Prop() duration = 5000;

  /** Émis à chaque fermeture : bouton Fermer, Échap, glissement, fin du temps ou open à false. */
  @Event() crClose: EventEmitter<void>;

  @State() toast = false;
  @State() visible = false;

  private box?: HTMLElement;
  private timer?: number;
  private exit?: Animation;
  private enter = false;
  private direction = 1;

  connectedCallback() {
    this.toast = !!this.el.closest('cr-toaster');
  }

  componentWillLoad() {
    this.enter = !this.toast && Build.isBrowser && document.readyState === 'complete' && !initial.has(this.el);
    this.visible = this.open && !this.toast;
  }

  componentDidLoad() {
    // La zone annoncée doit exister vide avant le message, sinon les lecteurs d'écran ne lisent pas la notification.
    if (this.toast) this.timer = window.setTimeout(() => this.openChanged(), 100);
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  @Watch('open')
  async openChanged() {
    if (this.open) {
      this.exit?.cancel();
      this.box?.style.removeProperty('transform');
      this.box?.style.removeProperty('opacity');
      this.visible = true;
      return;
    }
    if (!this.visible || !this.box) return;
    this.exit = leave(this.el, this.box, this.toast, this.direction);
    await this.exit.finished.catch(() => undefined);
    this.direction = 1;
    if (this.open) return;
    this.visible = false;
    this.crClose.emit();
  }

  private close = (direction = 1) => {
    this.direction = direction;
    this.open = false;
  };

  private onPointerDown = swipe((direction) => this.close(direction));

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.close();
  };

  render() {
    const m = t(this.el);
    const { toast, visible } = this;
    return (
      <Host hidden={!toast && !visible} data-toast={toast ? '' : undefined} data-enter={this.enter ? '' : undefined}>
        <div class="clip">
          <div
            class="alert"
            part="alert"
            data-visible={visible ? '' : undefined}
            ref={(el) => (this.box = el)}
            onKeyDown={toast ? this.onKeyDown : undefined}
            onPointerDown={toast ? this.onPointerDown : undefined}
          >
            {visible && <AlertIcon variant={this.variant} />}
            <div class="content" role={this.variant === 'danger' ? 'alert' : 'status'}>
              {visible && <span class="sr-only">{m.alertPrefix[this.variant]}</span>}
              {visible && this.heading && (
                <strong class="heading" part="heading">
                  {this.heading}
                </strong>
              )}
              {visible && <slot />}
            </div>
            {visible && (toast || this.dismissible) && (
              <button type="button" class="close" part="close" aria-label={m.close} onClick={() => this.close()}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            )}
            {visible && toast && this.duration > 0 && (
              <span class="bar" part="bar" style={{ animationDuration: `${this.duration}ms` }} onAnimationEnd={() => this.close()} />
            )}
          </div>
        </div>
      </Host>
    );
  }
}
