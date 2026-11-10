import { AttachInternals, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Curseur : choix d'une valeur numérique dans un intervalle, à la souris, au doigt ou au clavier (flèches, Page précédente/suivante, Début, Fin).
 * Une bulle suit la pastille en affichant la valeur et grossit pendant le glissement ou au focus ; la partie remplie du rail suit la valeur.
 * @part label - Le libellé.
 * @part control - Le curseur natif (input type="range").
 * @part bubble - La bulle qui affiche la valeur.
 */
@Component({
  tag: 'cr-slider',
  styleUrls: ['../../global/field.css', 'cr-slider.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrSlider {
  @Element() el!: HTMLCrSliderElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du curseur (obligatoire). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur minimale. */
  @Prop() min = 0;
  /** Valeur maximale. */
  @Prop() max = 100;
  /** Écart entre deux valeurs possibles. */
  @Prop() step = 1;
  /** Valeur choisie, ramenée entre min et max. */
  @Prop({ mutable: true }) value = 0;
  /** Désactive le curseur. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis pendant le glissement, à chaque nouvelle valeur ; detail : la valeur. */
  @Event() crInput: EventEmitter<number>;
  /** Émis quand l'utilisateur relâche la pastille ou change la valeur au clavier ; detail : la valeur. */
  @Event() crChange: EventEmitter<number>;

  private input?: HTMLInputElement;
  private initialValue?: number;

  componentDidRender() {
    this.internals.setFormValue(this.input?.value ?? String(this.value));
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private onInput = (event: Event) => {
    this.initialValue ??= this.value;
    this.value = (event.target as HTMLInputElement).valueAsNumber;
    this.crInput.emit(this.value);
  };

  render() {
    const value = Math.min(this.max, Math.max(this.min, this.value));
    const ratio = this.max > this.min ? (value - this.min) / (this.max - this.min) : 0;
    return (
      <div class="field">
        <label class="label" htmlFor="control" part="label">
          {this.label}
        </label>
        <div class="slider" style={{ '--ratio': String(ratio) }}>
          <input
            ref={(el) => (this.input = el)}
            id="control"
            class="input"
            part="control"
            type="range"
            min={this.min}
            max={this.max}
            step={this.step}
            value={String(value)}
            disabled={this.disabled}
            onInput={this.onInput}
            onChange={() => this.crChange.emit(this.value)}
          />
          <span class="bubble" part="bubble" aria-hidden="true">
            {value.toLocaleString(t(this.el).locale)}
          </span>
        </div>
      </div>
    );
  }
}
