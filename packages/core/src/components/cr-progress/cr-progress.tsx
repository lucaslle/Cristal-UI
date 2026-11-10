import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';

const COUNT_MS = 1000;
const clamp = (value: number) => Math.min(100, Math.max(0, value));

/**
 * Barre de progression. Avec value, elle se remplit jusqu'à la valeur ; sans, un segment glisse en boucle (durée inconnue).
 * @part track - Le rail.
 * @part bar - La partie remplie.
 * @part value - Le pourcentage affiché avec show-value.
 */
@Component({
  tag: 'cr-progress',
  styleUrl: 'cr-progress.css',
  shadow: true,
})
export class CrProgress {
  @Element() el!: HTMLCrProgressElement;

  /** Avancement de 0 à 100. Sans valeur, la barre est indéterminée. */
  @Prop() value?: number;
  /** Nom lu par les lecteurs d'écran (« Progression » par défaut). */
  @Prop() label?: string;
  /** Affiche le pourcentage en grand au-dessus de la barre ; il compte jusqu'à chaque nouvelle valeur. */
  @Prop() showValue = false;

  @State() shown = 0;
  private frame?: number;

  componentWillLoad() {
    this.shown = clamp(this.value ?? 0);
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.frame!);
  }

  @Watch('value')
  count(next?: number) {
    cancelAnimationFrame(this.frame!);
    const from = this.shown;
    const to = clamp(next ?? 0);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.shown = to;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      this.shown = from + (to - from) * (1 - (1 - progress) ** 3);
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  render() {
    const determinate = typeof this.value === 'number' && Number.isFinite(this.value);
    const value = determinate ? clamp(this.value!) : undefined;
    return (
      <Host>
        {this.showValue && determinate && (
          <div class="value" part="value" aria-hidden="true">
            {Math.round(this.shown)}
            <span class="unit">%</span>
          </div>
        )}
        <div
          class="track"
          part="track"
          role="progressbar"
          aria-label={this.label ?? t(this.el).progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
        >
          <div class={{ bar: true, indeterminate: !determinate }} part="bar" style={determinate ? { width: `${value}%` } : undefined} />
        </div>
      </Host>
    );
  }
}
