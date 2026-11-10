import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { ToastIcon, swipe } from '../../utils/toast';

const LEAVE_MS = 200;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Notification temporaire : un message court qui glisse en bas à droite (dans un cr-toaster), puis se ferme seul.
 * Une barre montre le temps restant ; il s'arrête tant que la souris ou le focus est sur le toast.
 * On peut aussi le fermer avec le bouton Fermer, Échap, ou en le faisant glisser sur le côté.
 * @slot - Le message.
 * @part toast - La boîte du toast.
 * @part close - Le bouton Fermer.
 * @part bar - La barre du temps restant.
 */
@Component({
  tag: 'cr-toast',
  styleUrl: 'cr-toast.css',
  shadow: true,
})
export class CrToast {
  @Element() el!: HTMLCrToastElement;

  /** Affiche ou ferme le toast. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Type de message : info, success (réussite) ou danger (erreur, lue aussitôt par les lecteurs d'écran). */
  @Prop({ reflect: true }) variant: 'info' | 'success' | 'danger' = 'info';
  /** Durée d'affichage en millisecondes avant la fermeture automatique ; 0 : le toast reste jusqu'à ce qu'on le ferme. */
  @Prop() duration = 5000;

  /** Émis à chaque fermeture : fin du temps, bouton Fermer, Échap, glissement ou open à false. */
  @Event() crClose: EventEmitter<void>;

  @State() visible = false;

  private box?: HTMLElement;
  private timer?: number;
  private exit?: Animation;
  private direction = 1;

  componentDidLoad() {
    // La zone annoncée doit exister vide avant le message, sinon les lecteurs d'écran ne le lisent pas.
    this.timer = window.setTimeout(() => this.openChanged(), 100);
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
    const keyframe = reducedMotion() ? { opacity: 0 } : { opacity: 0, transform: `translateX(${this.direction * 110}%)` };
    this.exit = this.box.animate([keyframe], { duration: LEAVE_MS, easing: 'ease-in', fill: 'forwards' });
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
    const visible = this.visible;
    return (
      <div
        class="toast"
        part="toast"
        data-visible={visible ? '' : undefined}
        ref={(el) => (this.box = el)}
        onKeyDown={this.onKeyDown}
        onPointerDown={this.onPointerDown}
      >
        {visible && <ToastIcon variant={this.variant} />}
        <div class="message" role={this.variant === 'danger' ? 'alert' : 'status'}>
          {visible && <slot />}
        </div>
        {visible && (
          <button type="button" class="close" part="close" aria-label={t(this.el).close} onClick={() => this.close()}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        )}
        {visible && this.duration > 0 && (
          <span class="bar" part="bar" style={{ animationDuration: `${this.duration}ms` }} onAnimationEnd={() => this.close()} />
        )}
      </div>
    );
  }
}
