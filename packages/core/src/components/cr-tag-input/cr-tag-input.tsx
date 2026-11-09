import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldHeader, describedBy } from '../../utils/field';
import { reducedMotion } from '../../utils/popup';
import { handleInvalid } from '../../utils/validation';

/**
 * Saisie d'étiquettes : chaque mot validé (Entrée ou virgule) devient une pastille, retirable avec ×.
 * @part label - Le libellé.
 * @part tag - Une étiquette.
 */
@Component({
  tag: 'cr-tag-input',
  styleUrls: ['../../global/field.css', 'cr-tag-input.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrTagInput {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du champ. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire, une fois par étiquette. */
  @Prop({ reflect: true }) name?: string;
  /** Étiquettes saisies. */
  @Prop({ mutable: true }) values: string[] = [];
  /** Texte indicatif affiché quand le champ est vide. */
  @Prop() placeholder?: string;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique. */
  @Prop() error?: string;
  /** Demande au moins une étiquette. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand la liste change ; detail : les étiquettes. */
  @Event() crChange: EventEmitter<string[]>;

  @State() message = '';
  @State() touched = false;
  /** Étiquettes ajoutées par l'utilisateur : seules elles jouent l'animation d'apparition, pas celles du départ. */
  @State() fresh: string[] = [];

  private input?: HTMLInputElement;
  private list?: HTMLElement;
  private initial?: string[];

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  formResetCallback() {
    if (this.initial) this.values = this.initial;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  componentDidRender() {
    const data = new FormData();
    if (this.name) this.values.forEach((value) => data.append(this.name!, value));
    this.internals.setFormValue(this.values.length ? data : null);
    const missing = this.required && !this.values.length;
    this.internals.setValidity(missing ? { valueMissing: true } : {}, missing ? 'Ajoutez au moins une étiquette.' : '', this.input);
  }

  private update(next: string[], message: string) {
    this.initial ??= this.values;
    this.values = next;
    this.message = message;
    this.crChange.emit(next);
  }

  private add(text: string) {
    const words = text.split(',').map((word) => word.trim()).filter(Boolean);
    const fresh = words.filter((word, i) => !this.values.some((v) => v.toLowerCase() === word.toLowerCase()) && words.indexOf(word) === i);
    if (fresh.length) this.fresh = [...this.fresh, ...fresh];
    if (fresh.length) this.update([...this.values, ...fresh], `${fresh.join(', ')} ${fresh.length > 1 ? 'ajoutées' : 'ajoutée'}. ${this.values.length + fresh.length} étiquettes.`);
    else if (words.length) this.message = `${words[0]} est déjà dans la liste.`;
  }

  private async remove(value: string, refocus: boolean) {
    const tag = Array.from(this.list?.children ?? []).find((el) => (el as HTMLElement).dataset.value === value) as HTMLElement | undefined;
    if (tag && !reducedMotion()) await tag.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(0.6)', opacity: 0 }], { duration: 160, easing: 'ease-in' }).finished;
    const next = this.values.filter((v) => v !== value);
    this.update(next, `${value} retirée. ${next.length} étiquettes.`);
    if (refocus) this.input?.focus();
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const input = event.target as HTMLInputElement;
    if ((event.key === 'Enter' || event.key === ',') && input.value.trim()) {
      event.preventDefault();
      this.add(input.value);
      input.value = '';
    } else if (event.key === 'Enter') this.internals.form?.requestSubmit();
    else if (event.key === 'Backspace' && !input.value && this.values.length) this.remove(this.values[this.values.length - 1], false);
  };

  private onPaste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!text.includes(',')) return;
    event.preventDefault();
    this.add(text);
  };

  render() {
    const id = 'control';
    const error = this.error || (this.touched && this.required && !this.values.length ? 'Ajoutez au moins une étiquette.' : '');
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={this.required} hint={this.hint} error={error} />
        <div class={{ tags: true, invalid: !!error, disabled: this.disabled }} onClick={() => this.input?.focus()}>
          <ul ref={(el) => (this.list = el)} class="list" aria-label={`${this.label} : ${this.values.length} étiquettes`}>
            {this.values.map((value) => (
              <li key={value} class={{ tag: true, pop: this.fresh.includes(value) }} part="tag" data-value={value}>
                {value}
                <button type="button" class="remove" aria-label={`Retirer ${value}`} disabled={this.disabled} onClick={(event) => (event.stopPropagation(), this.remove(value, true))}>
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <input
            ref={(el) => (this.input = el)}
            id={id}
            class="entry"
            placeholder={this.values.length ? '' : this.placeholder}
            disabled={this.disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={[describedBy({ id, hint: this.hint, error }), `${id}-help`].filter(Boolean).join(' ')}
            onKeyDown={this.onKeyDown}
            onPaste={this.onPaste}
            onBlur={(event) => ((this.touched = true), (event.target as HTMLInputElement).value.trim() && (this.add((event.target as HTMLInputElement).value), ((event.target as HTMLInputElement).value = '')))}
          />
        </div>
        <span id={`${id}-help`} class="sr-only">
          Entrée ou virgule pour ajouter, retour arrière pour retirer la dernière.
        </span>
        <span class="sr-only" role="status">
          {this.message}
        </span>
      </div>
    );
  }
}
