import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldHeader, describedBy } from '../../utils/field';
import { handleInvalid, kindOf, validationMessage } from '../../utils/validation';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

/**
 * Champ de saisie de texte.
 * @part label - Le libellé.
 * @part control - Le champ natif.
 * @part hint - Le texte d'aide.
 * @part error - Le message d'erreur.
 */
@Component({
  tag: 'cr-input',
  styleUrls: ['../../global/field.css', 'cr-input.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du champ. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur du champ. */
  @Prop({ mutable: true }) value = '';
  /** Type de saisie. */
  @Prop() type: InputType = 'text';
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique de validation. */
  @Prop() error?: string;
  /** Texte indicatif affiché quand le champ est vide. */
  @Prop() placeholder?: string;
  /** Indication de remplissage automatique du navigateur. */
  @Prop() autocomplete?: string;
  /** Rend la saisie obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis à chaque frappe ; detail : la valeur. */
  @Event() crInput: EventEmitter<string>;
  /** Émis quand le champ perd le focus après modification ; detail : la valeur. */
  @Event() crChange: EventEmitter<string>;

  @State() touched = false;

  private input?: HTMLInputElement;
  private initialValue?: string;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  componentDidRender() {
    this.syncForm();
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private syncForm() {
    this.internals.setFormValue(this.value);
    if (this.input) this.internals.setValidity(this.input.validity, validationMessage(this.input.validity, kindOf(this.type)), this.input);
  }

  private onInput = (event: Event) => {
    this.initialValue ??= this.value;
    this.value = (event.target as HTMLInputElement).value;
    this.syncForm();
    this.crInput.emit(this.value);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') this.internals.form?.requestSubmit();
  };

  render() {
    const id = 'control';
    const error = this.error || (this.touched ? validationMessage(this.input?.validity, kindOf(this.type)) : '');
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} />
        <input
          ref={(el) => (this.input = el)}
          id={id}
          class="control"
          part="control"
          type={this.type}
          name={this.name}
          value={this.value}
          placeholder={this.placeholder}
          autocomplete={this.autocomplete}
          required={this.required}
          disabled={this.disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy({ id, hint: this.hint, error })}
          onInput={this.onInput}
          onChange={() => {
            this.touched = true;
            this.crChange.emit(this.value);
          }}
          onKeyDown={this.onKeyDown}
        />
      </div>
    );
  }
}
