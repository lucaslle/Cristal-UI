import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { FieldHeader, describedBy, ErrorAnimation } from '../../utils/field';
import { handleInvalid } from '../../utils/validation';

/**
 * Code à usage unique (reçu par SMS ou e-mail), une case par chiffre.
 * @part label - Le libellé.
 * @part box - Une case.
 */
@Component({
  tag: 'cr-otp',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-otp.css', 'cr-otp-motion.css', 'cr-otp-morph.css'],
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
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';
  /**
   * Animation de la saisie : pop (le chiffre apparaît, vague verte à la fin, par défaut), bounce (le chiffre tombe, la case s'écrase et rebondit),
   * stretch (un seul anneau de focus s'étire de case en case, puis entoure tout le code), spin (les chiffres défilent comme une machine à sous),
   * merge (à la fin, les cases se rejoignent en une seule barre), zoom (le chiffre arrive en grand, un reflet balaie le code complet)
   * ou tint (la case se remplit de couleur par le bas, verte à la fin).
   */
  @Prop({ reflect: true }) animation: 'pop' | 'bounce' | 'stretch' | 'spin' | 'merge' | 'zoom' | 'tint' = 'pop';

  /** Émis à chaque chiffre ; detail : le code. */
  @Event() crInput: EventEmitter<string>;
  /** Émis quand toutes les cases sont remplies ; detail : le code. */
  @Event() crComplete: EventEmitter<string>;

  @State() focused = false;
  @State() touched = false;

  private input?: HTMLInputElement;
  /** Longueur du code avant le dernier changement : les chiffres collés d'un coup arrivent en cascade, l'anneau sait dans quel sens aller. */
  private from = 0;

  @Watch('value')
  valueChanged(_next: string, previous: string) {
    this.from = previous?.length ?? 0;
  }

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
    if (!this.value) return this.required ? t(this.el).required : '';
    return t(this.el).otpDigits(this.length);
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
    const spin = this.animation === 'spin';
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} animation={this.errorAnimation} />
        <div class={{ otp: true, 'error-frame': true, complete, invalid: !!error, back: this.value.length < this.from }} style={{ '--n': `${this.length}` }}>
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
            <span
              class={{ box: true, filled: i < this.value.length, active: this.focused && !complete && i === active }}
              part="box"
              style={{ '--i': `${i}`, '--j': `${Math.max(0, i - this.from)}` }}
              aria-hidden="true"
            >
              {this.value[i] && (
                // spin : la bande des chiffres qui défilent avant celui-ci, dessinée par ::after (le contenu généré n'est pas du texte lu).
                <span class="digit" data-reel={spin ? reel(Number(this.value[i])) : undefined}>
                  {this.value[i]}
                </span>
              )}
            </span>
          ))}
          {this.animation === 'stretch' && <span class={{ ring: true, on: this.focused }} style={{ '--a': `${complete ? 0 : active}`, '--b': `${active}` }} aria-hidden="true" />}
        </div>
      </div>
    );
  }
}

// Les 15 chiffres sous le chiffre d, du plus proche au plus loin : d-1, d-2… (le 10e redonne d, pour boucler sans saut).
const reel = (d: number) => Array.from({ length: 15 }, (_, j) => (d + 19 - j) % 10).join('');
