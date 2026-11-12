import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { CardEditor, CardFields, CardInputs } from '../../utils/card-layouts';
import { CardVisual } from '../../utils/card-visual';
import { cardError, cardLength, caretAfter, digitsOf, expiryError, formatExpiry, groupCard } from '../../utils/card';
import { FieldHeader, describedBy, ErrorAnimation } from '../../utils/field';
import { handleInvalid } from '../../utils/validation';
import { t } from '../../utils/i18n';

export interface CardValue {
  number: string;
  expiry: string;
  cvc: string;
  holder: string;
}

/**
 * Carte bancaire : numéro groupé par 4 pendant la frappe, puis date d'expiration et cryptogramme qui apparaissent.
 * Envoie name (numéro sans espaces), name-expiry, name-cvc (et name-holder avec holder) avec le formulaire.
 * @part label - Le libellé.
 * @part control - Le champ du numéro.
 */
@Component({
  tag: 'cr-card-input',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-card-input.css', 'card-visual.css', 'card-editor.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrCardInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du numéro. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire (name, name-expiry, name-cvc). */
  @Prop({ reflect: true }) name?: string;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique. */
  @Prop() error?: string;
  /** Rend la saisie obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive les champs. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';
  /** Affiche une carte dessinée qui se remplit pendant la frappe et se retourne pour le cryptogramme. */
  @Prop() preview = false;
  /** Ajoute le champ « Titulaire » (nom inscrit sur la carte), envoyé sous name-holder. */
  @Prop() holder = false;
  /** fields : champs classiques ; card : tout se saisit directement sur la carte dessinée. */
  @Prop() variant: 'fields' | 'card' = 'fields';

  /** Émis à chaque frappe ; detail : numéro (chiffres), date d'expiration et cryptogramme. */
  @Event() crInput: EventEmitter<CardValue>;

  @State() digits = '';
  @State() expiry = '';
  @State() cvc = '';
  @State() holderName = '';
  @State() touched = false;
  @State() cvcFocused = false;
  /** Champs que l'utilisateur a quittés : leur erreur peut s'afficher. */
  @State() left: string[] = [];

  private input?: HTMLInputElement;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  formResetCallback() {
    this.digits = this.expiry = this.cvc = this.holderName = '';
    this.touched = false;
    this.left = [];
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Champ dont parle le message d'erreur courant. */
  private errorField() {
    const m = t(this.el);
    if (!this.digits || cardError(this.digits, m)) return 'number';
    return expiryError(this.expiry, m) ? 'expiry' : 'cvc';
  }

  private message() {
    const m = t(this.el);
    if (!this.digits && !this.required) return '';
    if (!this.digits) return m.required;
    return cardError(this.digits, m) || expiryError(this.expiry, m) || (/^\d{3,4}$/.test(this.cvc) ? '' : m.cvcMissing);
  }

  componentDidRender() {
    const message = this.message();
    const data = new FormData();
    const fields = [['', this.digits], ['-expiry', this.expiry], ['-cvc', this.cvc], ...(this.holder ? [['-holder', this.holderName.trim()]] : [])];
    if (this.name && this.digits) fields.forEach(([suffix, value]) => data.append(`${this.name}${suffix}`, value));
    this.internals.setFormValue(this.digits ? data : null);
    this.internals.setValidity(message ? { customError: true } : {}, message, this.input);
  }

  private emit() {
    this.crInput.emit({ number: this.digits, expiry: this.expiry, cvc: this.cvc, holder: this.holderName });
  }

  private onNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const before = digitsOf(input.value.slice(0, input.selectionStart ?? input.value.length)).length;
    const all = digitsOf(input.value);
    this.digits = all.slice(0, cardLength(all));
    const text = groupCard(this.digits);
    input.value = text;
    const caret = caretAfter(text, Math.min(before, this.digits.length));
    input.setSelectionRange(caret, caret);
    this.emit();
  };

  /** Attributs des quatre champs, partagés par les deux présentations. */
  private inputs(described: string | undefined, wrong: string): CardInputs {
    const blur = (field: string) => () => !this.left.includes(field) && (this.left = [...this.left, field]);
    const common = { disabled: this.disabled, 'aria-describedby': described };
    const typed = (set: (value: string) => string) => (event: Event) => {
      const input = event.target as HTMLInputElement;
      input.value = set(input.value);
      this.emit();
    };
    const invalid = (field: string) => (wrong === field ? 'true' : undefined);
    return {
      number: { ...common, onBlur: blur('number'), ref: (el: HTMLInputElement) => (this.input = el), id: 'control', part: 'control', value: groupCard(this.digits), inputMode: 'numeric', autocomplete: 'cc-number', required: this.required, 'aria-invalid': invalid('number'), onInput: this.onNumber },
      holder: { ...common, onBlur: blur('holder'), id: 'holder', value: this.holderName, autocomplete: 'cc-name', onInput: typed((value) => (this.holderName = value)) },
      expiry: { ...common, onBlur: blur('expiry'), id: 'expiry', value: this.expiry, inputMode: 'numeric', autocomplete: 'cc-exp', maxLength: 5, 'aria-invalid': invalid('expiry'), onInput: typed((value) => (this.expiry = formatExpiry(value))) },
      cvc: {
        ...common,
        id: 'cvc',
        value: this.cvc,
        inputMode: 'numeric',
        autocomplete: 'cc-csc',
        maxLength: 4,
        'aria-invalid': invalid('cvc'),
        onFocus: () => (this.cvcFocused = true),
        onBlur: () => ((this.cvcFocused = false), blur('cvc')()),
        onInput: typed((value) => (this.cvc = digitsOf(value).slice(0, 4))),
      },
    };
  }

  render() {
    const id = 'control';
    const complete = this.digits.length === cardLength(this.digits);
    // Une erreur s'affiche une fois le champ concerné quitté, ou à l'envoi ; le contour rouge va à ce champ.
    const field = this.errorField();
    const error = this.error || (this.touched || this.left.includes(field) ? this.message() : '');
    const wrong = error ? field : '';
    const inputs = this.inputs(describedBy({ id, hint: this.hint, error }), wrong);
    return (
      <div class="field">
        {this.preview && this.variant !== 'card' && <CardVisual digits={this.digits} expiry={this.expiry} cvc={this.cvc} holder={this.holderName} flipped={this.cvcFocused} m={t(this.el)} />}
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} animation={this.errorAnimation} />
        {this.variant === 'card' ? (
          <CardEditor inputs={inputs} digits={this.digits} holder={this.holder} flipped={this.cvcFocused} m={t(this.el)} />
        ) : (
          <CardFields inputs={inputs} complete={complete} holder={this.holder} m={t(this.el)} />
        )}
      </div>
    );
  }
}
