import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldHeader, describedBy } from '../../utils/field';
import { handleInvalid } from '../../utils/validation';

/**
 * Code à usage unique (reçu par SMS ou e-mail), une case par chiffre.
 * @part label - Le libellé.
 * @part box - Une case.
 */
@Component({
  tag: 'cr-otp',
  styleUrls: ['../../global/field.css', 'cr-otp.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrOtp {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus des cases. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Code saisi (chiffres). */
  @Prop({ mutable: true }) value = '';
  /** Nombre de chiffres. */
  @Prop() length = 6;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique. */
  @Prop() error?: string;
  /** Rend la saisie obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis à chaque chiffre ; detail : le code. */
  @Event() crInput: EventEmitter<string>;
  /** Émis quand toutes les cases sont remplies ; detail : le code. */
  @Event() crComplete: EventEmitter<string>;

  @State() focused = false;
  @State() touched = false;

  private input?: HTMLInputElement;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  formResetCallback() {
    this.value = '';
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private message() {
    if (this.value.length === this.length) return '';
    if (!this.value) return this.required ? 'Ce champ est obligatoire.' : '';
    return `Saisissez les ${this.length} chiffres du code.`;
  }

  componentDidRender() {
    const message = this.message();
    this.internals.setFormValue(this.value || null);
    this.internals.setValidity(message ? { patternMismatch: true } : {}, message, this.input);
  }

  private onInput = (event: Event) => {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, this.length);
    (event.target as HTMLInputElement).value = digits;
    if (digits === this.value) return;
    this.value = digits;
    this.crInput.emit(digits);
    if (digits.length === this.length) this.crComplete.emit(digits);
  };

  render() {
    const id = 'control';
    const complete = this.value.length === this.length;
    const error = this.error || (this.touched ? this.message() : '');
    const active = Math.min(this.value.length, this.length - 1);
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} />
        <div class={{ otp: true, complete, invalid: !!error }} style={{ '--n': `${this.length}` }}>
          <input
            ref={(el) => (this.input = el)}
            id={id}
            class="otp-input"
            name={this.name}
            value={this.value}
            inputMode="numeric"
            autocomplete="one-time-code"
            required={this.required}
            disabled={this.disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy({ id, hint: this.hint, error })}
            onInput={this.onInput}
            onFocus={() => (this.focused = true)}
            onBlur={() => ((this.focused = false), (this.touched = this.touched || !!this.value))}
            onSelect={(event) => {
              const input = event.target as HTMLInputElement;
              input.setSelectionRange(input.value.length, input.value.length);
            }}
          />
          {Array.from({ length: this.length }, (_, i) => (
            <span class={{ box: true, filled: i < this.value.length, active: this.focused && !complete && i === active }} part="box" style={{ '--i': `${i}` }} aria-hidden="true">
              {this.value[i] && <span class="digit">{this.value[i]}</span>}
            </span>
          ))}
        </div>
      </div>
    );
  }
}
