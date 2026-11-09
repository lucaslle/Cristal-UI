import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { CardVisual } from '../../utils/card-visual';
import { cardError, cardLength, caretAfter, digitsOf, expiryError, formatExpiry, groupCard } from '../../utils/card';
import { FieldHeader, describedBy } from '../../utils/field';
import { handleInvalid } from '../../utils/validation';

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
  styleUrls: ['../../global/field.css', 'cr-card-input.css', 'card-visual.css'],
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
  /** Affiche une carte dessinée qui se remplit pendant la frappe et se retourne pour le cryptogramme. */
  @Prop() preview = false;
  /** Ajoute le champ « Titulaire » (nom inscrit sur la carte), envoyé sous name-holder. */
  @Prop() holder = false;

  /** Émis à chaque frappe ; detail : numéro (chiffres), date d'expiration et cryptogramme. */
  @Event() crInput: EventEmitter<CardValue>;

  @State() digits = '';
  @State() expiry = '';
  @State() cvc = '';
  @State() holderName = '';
  @State() touched = false;
  @State() cvcFocused = false;

  private input?: HTMLInputElement;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  formResetCallback() {
    this.digits = this.expiry = this.cvc = this.holderName = '';
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private message() {
    if (!this.digits && !this.required) return '';
    if (!this.digits) return 'Ce champ est obligatoire.';
    return cardError(this.digits) || expiryError(this.expiry) || (/^\d{3,4}$/.test(this.cvc) ? '' : 'Saisissez le cryptogramme à 3 ou 4 chiffres, au dos de la carte.');
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

  render() {
    const id = 'control';
    const error = this.error || (this.touched ? this.message() : '');
    const described = describedBy({ id, hint: this.hint, error });
    const complete = this.digits.length === cardLength(this.digits);
    // Le contour rouge va au champ dont parle l'erreur affichée.
    const wrong = !error ? '' : !complete || cardError(this.digits) ? 'number' : expiryError(this.expiry) ? 'expiry' : 'cvc';
    const blur = () => (this.touched = this.touched || !!this.digits);
    return (
      <div class="field">
        {this.preview && <CardVisual digits={this.digits} expiry={this.expiry} cvc={this.cvc} holder={this.holderName} flipped={this.cvcFocused} />}
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} />
        <div class="card">
          <div class="number">
            <svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M2.5 9.5h19M6 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <input
              ref={(el) => (this.input = el)}
              id={id}
              class="control"
              part="control"
              value={groupCard(this.digits)}
              inputMode="numeric"
              autocomplete="cc-number"
              placeholder="1234 5678 9012 3456"
              required={this.required}
              disabled={this.disabled}
              aria-invalid={wrong === 'number' ? 'true' : undefined}
              aria-describedby={described}
              onInput={this.onNumber}
              onBlur={blur}
            />
          </div>
          {complete && (
            <div class="extra">
              {this.holder && (
                <label class="mini holder-field">
                  <span>Titulaire</span>
                  <input class="control" value={this.holderName} autocomplete="cc-name" placeholder="Nom sur la carte" disabled={this.disabled} aria-describedby={described} onBlur={blur}
                    onInput={(event) => ((this.holderName = (event.target as HTMLInputElement).value), this.emit())} />
                </label>
              )}
              <label class="mini">
                <span>Expiration</span>
                <input class="control" value={this.expiry} inputMode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxLength={5} disabled={this.disabled}
                  aria-invalid={wrong === 'expiry' ? 'true' : undefined} aria-describedby={described} onBlur={blur}
                  onInput={(event) => ((this.expiry = formatExpiry((event.target as HTMLInputElement).value)), ((event.target as HTMLInputElement).value = this.expiry), this.emit())} />
              </label>
              <label class="mini">
                <span>CVC</span>
                <input class="control" value={this.cvc} inputMode="numeric" autocomplete="cc-csc" placeholder="123" maxLength={4} disabled={this.disabled} aria-invalid={wrong === 'cvc' ? 'true' : undefined} aria-describedby={described}
                  onFocus={() => (this.cvcFocused = true)} onBlur={() => ((this.cvcFocused = false), blur())}
                  onInput={(event) => ((this.cvc = digitsOf((event.target as HTMLInputElement).value).slice(0, 4)), ((event.target as HTMLInputElement).value = this.cvc), this.emit())} />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }
}
