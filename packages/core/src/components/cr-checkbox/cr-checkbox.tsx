import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldText, RequiredMark, describedBy, ErrorAnimation } from '../../utils/field';
import { handleInvalid, validationMessage } from '../../utils/validation';
import { t } from '../../utils/i18n';

/**
 * Case à cocher.
 * @part label - Le libellé.
 * @part control - La case native.
 * @part hint - Le texte d'aide.
 * @part error - Le message d'erreur.
 */
@Component({
  tag: 'cr-checkbox',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-checkbox.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrCheckbox {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché à côté de la case. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur envoyée quand la case est cochée. */
  @Prop() value = 'on';
  /** État coché. */
  @Prop({ mutable: true, reflect: true }) checked = false;
  /** État partiellement coché, par exemple pour « tout sélectionner ». */
  @Prop() indeterminate = false;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique de validation. */
  @Prop() error?: string;
  /** Rend la case obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive la case. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';

  /** Émis quand la case change ; detail : l'état coché. */
  @Event() crChange: EventEmitter<boolean>;

  @State() touched = false;

  private input?: HTMLInputElement;
  private initialChecked?: boolean;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  componentDidRender() {
    if (this.input) this.input.indeterminate = this.indeterminate;
    this.syncForm();
  }

  formResetCallback() {
    if (this.initialChecked !== undefined) this.checked = this.initialChecked;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private syncForm() {
    this.internals.setFormValue(this.checked ? this.value : null);
    if (this.input) this.internals.setValidity(this.input.validity, validationMessage(this.input.validity, 'checkbox', t(this.el)), this.input);
  }

  private onChange = (event: Event) => {
    this.initialChecked ??= this.checked;
    this.touched = true;
    this.checked = (event.target as HTMLInputElement).checked;
    this.syncForm();
    this.crChange.emit(this.checked);
  };

  render() {
    const id = 'control';
    const error = this.error || (this.touched ? validationMessage(this.input?.validity, 'checkbox', t(this.el)) : '');
    return (
      <div class="field">
        <div class="row error-frame">
          <input
            ref={(el) => (this.input = el)}
            id={id}
            class="box"
            part="control"
            type="checkbox"
            checked={this.checked}
            required={this.required}
            disabled={this.disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy({ id, hint: this.hint, error })}
            onChange={this.onChange}
          />
          <label class="label" htmlFor={id} part="label">
            {this.label}
            <RequiredMark required={this.required} />
          </label>
        </div>
        <FieldText id={id} hint={this.hint} error={error} animation={this.errorAnimation} />
      </div>
    );
  }
}
