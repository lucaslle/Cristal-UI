import { Component, Element, Event, EventEmitter, Host, Method, Prop, State, Watch, forceUpdate, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { EASE } from '../../utils/accordion';
import { reducedMotion } from '../../utils/popup';
import { StepperVariant, ballPosition, stepState } from '../../utils/stepper';
import { BlocksView, GaugeView, LineView, NumberView, PathView } from '../../utils/stepper-views';

/**
 * Progression en étapes. Les étapes sont des éléments cr-step enfants.
 * @slot - Les étapes cr-step.
 * @part nav - Les boutons Précédent et Suivant.
 */
@Component({
  tag: 'cr-stepper',
  styleUrls: ['cr-stepper.css', 'shapes.css'],
  shadow: true,
})
export class CrStepper {
  @Element() el!: HTMLCrStepperElement;

  /** Index de l'étape en cours (0 pour la première) ; vaut le nombre d'étapes quand tout est terminé. */
  @Prop({ mutable: true }) current = 0;
  /** Présentation : line (Bead Line), number (Big Number), path (Skill Path), blocks (Level Blocks), gauge (Gauge Arc) ou timeline (verticale). */
  @Prop({ reflect: true }) variant: StepperVariant = 'line';
  /** Ajoute les boutons « Précédent » et « Suivant » (« Terminer » à la dernière étape). */
  @Prop() navigation = false;
  /** Nom de la progression, lu par les lecteurs d'écran (« Progress », ou « Progression » en français, par défaut). */
  @Prop() label?: string;

  /** Émis à chaque changement d'étape ; detail : l'index de la nouvelle étape. */
  @Event() crStepChange: EventEmitter<number>;
  /** Émis quand la dernière étape est validée. */
  @Event() crComplete: EventEmitter<void>;

  @State() announce = '';

  private ball?: HTMLElement;
  private hop?: { from: number; to: number };
  private focusState?: { step?: HTMLCrStepElement; nav: boolean };

  private steps = () => Array.from(this.el.children).filter((child): child is HTMLCrStepElement => child.tagName === 'CR-STEP');

  @Watch('current')
  onCurrentChange(next: number, previous: number) {
    const labels = this.steps().map((step) => step.label);
    this.el.dataset.direction = next < previous ? 'back' : 'forward';
    this.focusState = { step: this.steps().find((step) => step.contains(document.activeElement)), nav: !!this.el.shadowRoot?.activeElement };
    this.hop = { from: previous, to: next };
    const m = t(this.el);
    this.announce = next >= labels.length ? m.allStepsDone : m.stepAnnounce(next + 1, labels.length, labels[next]);
    this.refresh();
    this.crStepChange.emit(next);
    if (next >= labels.length) this.crComplete.emit();
  }

  @Watch('variant')
  refresh() {
    this.steps().forEach((step) => forceUpdate(step));
  }

  /** Passe à l'étape suivante ; après la dernière, toutes les étapes sont terminées. */
  @Method()
  async next() {
    this.current = Math.min(this.current + 1, this.steps().length);
  }

  /** Revient à l'étape précédente. */
  @Method()
  async previous() {
    this.current = Math.max(this.current - 1, 0);
  }

  /** Va directement à une étape (index à partir de 0). */
  @Method()
  async goTo(index: number) {
    this.current = Math.max(0, Math.min(index, this.steps().length));
  }

  componentDidRender() {
    const count = this.steps().length;
    if (this.hop && this.ball && !reducedMotion()) {
      const from = ballPosition(this.hop.from, count);
      const to = ballPosition(this.hop.to, count);
      const top = `${Math.max(parseFloat(from.bottom), parseFloat(to.bottom)) + 12}%`;
      this.ball.animate([from, { left: `calc((${from.left} + ${to.left}) / 2)`, bottom: top }, to], { duration: 520, easing: EASE });
    }
    this.hop = undefined;
    const focus = this.focusState;
    this.focusState = undefined;
    if (focus) requestAnimationFrame(() => this.restoreFocus(focus));
  }

  /** Le focus était dans une étape qui vient de se masquer, ou sur un bouton qui a disparu : on le replace. */
  private restoreFocus({ step, nav }: { step?: HTMLCrStepElement; nav: boolean }) {
    const target = this.steps()[this.current];
    if (step && step !== target) return (target ?? this.el).focus();
    if (nav && !this.el.shadowRoot?.activeElement) this.el.shadowRoot?.querySelector<HTMLElement>('.nav cr-button:not([disabled])')?.focus();
  }

  private view(labels: string[], current: number) {
    const props = { labels, current, m: t(this.el) };
    if (this.variant === 'number') return <NumberView {...props} />;
    if (this.variant === 'path') return <PathView {...props} />;
    if (this.variant === 'blocks') return <BlocksView {...props} ballRef={(el) => (this.ball = el)} />;
    if (this.variant === 'gauge') return <GaugeView {...props} />;
    if (this.variant === 'line') return <LineView {...props} />;
    return null;
  }

  render() {
    const labels = this.steps().map((step) => step.label ?? step.getAttribute('label') ?? '');
    const count = labels.length;
    const current = Math.min(this.current, count);
    const m = t(this.el);
    const titled = this.navigation && !['number', 'timeline'].includes(this.variant);
    return (
      <Host tabIndex={-1}>
        <div class="stepper" role="group" aria-label={this.label ?? m.progress}>
          {this.variant !== 'timeline' && (
            <ol class="sr-only">
              {labels.map((label, i) => (
                <li aria-current={i === current ? 'step' : undefined}>
                  {label} : {m.stepStatus[stepState(i, current)]}
                </li>
              ))}
            </ol>
          )}
          {this.view(labels, current)}
          {titled && (
            <div key={`title-${current}`} class="title" aria-hidden="true">
              <strong>{labels[current] ?? m.done}</strong>
              <span>{m.stepOf(Math.min(current + 1, count), count)}</span>
            </div>
          )}
          <p class="sr-only" aria-live="polite">
            {this.announce}
          </p>
          <slot />
          {this.navigation && (
            <div class="nav" part="nav">
              <cr-button variant="secondary" disabled={current === 0} onClick={() => this.previous()}>
                {m.previous}
              </cr-button>
              {current < count && <cr-button onClick={() => this.next()}>{current === count - 1 ? m.finish : m.next}</cr-button>}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
