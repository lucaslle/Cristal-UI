import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldHeader, describedBy } from '../../utils/field';
import { handleInvalid, validationMessage } from '../../utils/validation';

/**
 * Zone de texte sur plusieurs lignes qui grandit d'une ligne à la fois, avec un léger rebond.
 * @slot end - Contenu placé en bas à droite du champ (bouton d'envoi…).
 * @part label - Le libellé.
 * @part control - La zone de texte.
 */
@Component({
  tag: 'cr-textarea',
  styleUrls: ['../../global/field.css', 'cr-textarea.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrTextarea {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du champ. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Texte saisi. */
  @Prop({ mutable: true }) value = '';
  /** Nombre de lignes au départ. */
  @Prop() rows = 1;
  /** Nombre de lignes au-delà duquel le champ défile au lieu de grandir. */
  @Prop() maxRows = 8;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique. */
  @Prop() error?: string;
  /** Texte indicatif affiché quand le champ est vide. */
  @Prop() placeholder?: string;
  /** Rend la saisie obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis à chaque frappe ; detail : le texte. */
  @Event() crInput: EventEmitter<string>;

  @State() lines = 1;
  @State() touched = false;
  @State() hasEnd = false;

  private textarea?: HTMLTextAreaElement;
  private mirror?: HTMLElement;
  private initialValue?: string;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.textarea);
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  componentDidRender() {
    this.internals.setFormValue(this.value);
    if (this.textarea) this.internals.setValidity(this.textarea.validity, validationMessage(this.textarea.validity, 'text'), this.textarea);
    this.measure();
  }

  /** Compte les lignes avec une copie invisible du texte, à la même largeur. */
  private measure() {
    if (!this.mirror) return;
    const style = getComputedStyle(this.mirror);
    const lines = Math.round((this.mirror.scrollHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / (parseFloat(style.lineHeight) || 24));
    const next = Math.max(this.rows, Math.min(this.maxRows, lines));
    if (next !== this.lines) this.lines = next;
  }

  private onInput = (event: Event) => {
    this.initialValue ??= this.value;
    this.value = (event.target as HTMLTextAreaElement).value;
    this.crInput.emit(this.value);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) this.internals.form?.requestSubmit();
  };

  render() {
    const id = 'control';
    const error = this.error || (this.touched ? validationMessage(this.textarea?.validity, 'text') : '');
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} />
        <div class={{ grow: true, 'has-end': this.hasEnd }} style={{ '--lines': `${Math.max(this.lines, this.rows)}` }}>
          <div ref={(el) => (this.mirror = el)} class="mirror" aria-hidden="true">
            {`${this.value} `}
          </div>
          <textarea
            ref={(el) => (this.textarea = el)}
            id={id}
            class="control"
            part="control"
            name={this.name}
            value={this.value}
            placeholder={this.placeholder}
            required={this.required}
            disabled={this.disabled}
            rows={this.rows}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy({ id, hint: this.hint, error })}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            onChange={() => (this.touched = true)}
          />
          <span class="end">
            <slot name="end" onSlotchange={(event) => (this.hasEnd = (event.target as HTMLSlotElement).assignedElements().length > 0)} />
          </span>
        </div>
      </div>
    );
  }
}
