import { AttachInternals, Build, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldText, RequiredMark, describedBy } from '../../utils/field';
import { ListOption, edgeIndex, keyMove, matchIndex, readOptions, revealInList, watchOptions } from '../../utils/listbox';
import { Popup, PopupAnimation, createPopup } from '../../utils/popup';
import { PopupPanel } from '../../utils/popup-view';
import { ComboTrigger, OptionList } from '../../utils/listbox-view';
import { handleInvalid, missingMessage } from '../../utils/validation';

/**
 * Liste déroulante. Les options sont des éléments option enfants.
 * @part label - Le libellé.
 * @part control - Le bouton qui ouvre la liste.
 * @part listbox - La liste des options.
 * @part option - Une option.
 * @part hint - Le texte d'aide.
 * @part error - Le message d'erreur.
 */
@Component({
  tag: 'cr-select',
  styleUrls: ['../../global/field.css', '../../global/popup.css', 'cr-select.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrSelect {
  @Element() el!: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus de la liste. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur de l'option sélectionnée. */
  @Prop({ mutable: true }) value = '';
  /** Texte affiché tant qu'aucune option n'est choisie. */
  @Prop() placeholder?: string;
  /** Texte d'aide, lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Message d'erreur ; remplace le message automatique de validation. */
  @Prop() error?: string;
  /** Rend le choix obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive la liste. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation d'ouverture et de fermeture de la liste. */
  @Prop() animation: PopupAnimation = 'fade';

  /** Émis quand la sélection change ; detail : la valeur. */
  @Event() crChange: EventEmitter<string>;

  @State() options: ListOption[] = [];
  @State() open = false;
  @State() active = -1;
  @State() touched = false;

  private trigger?: HTMLButtonElement;
  private listbox?: HTMLElement;
  private unwatch?: () => void;
  private initialValue?: string;
  private typed = { text: '', at: 0 };
  private nextActive?: number;
  private popup?: Popup;

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, (options) => (this.options = options));
  }

  disconnectedCallback() {
    this.unwatch?.();
    this.popup?.destroy();
  }

  componentWillLoad() {
    this.options = readOptions(this.el);
  }

  componentDidRender() {
    if (!this.popup && this.listbox && this.trigger) {
      this.popup = createPopup({ popup: this.listbox, anchor: this.trigger, host: this.el, onOpen: this.onOpen, onClose: () => (this.open = false) });
    }
    this.internals.setFormValue(this.selectedValue() || null);
    const missing = this.required && !this.selectedValue();
    this.internals.setValidity(missing ? { valueMissing: true } : {}, missing ? missingMessage('select') : '', this.trigger);
    if (this.open) revealInList(this.listbox?.querySelector<HTMLElement>('[data-active]'));
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.trigger);
  }

  private selectedValue() {
    return this.value || (this.placeholder ? '' : (this.options.find((option) => !option.disabled)?.value ?? ''));
  }

  private select(index: number) {
    const option = this.options[index];
    if (!option || option.disabled) return;
    this.touched = true;
    if (option.value !== this.selectedValue()) {
      this.initialValue ??= this.selectedValue();
      this.value = option.value;
      this.crChange.emit(this.value);
    }
    this.popup?.close(this.listbox?.querySelector<HTMLElement>(`#option-${index}`) ?? undefined);
  }

  private onOpen = () => {
    this.open = true;
    const selected = this.options.findIndex((option) => option.value === this.selectedValue());
    this.active = this.nextActive ?? (selected >= 0 ? selected : edgeIndex(this.options, 'first'));
    this.nextActive = undefined;
  };

  private show(index?: number) {
    this.nextActive = index;
    this.active = index ?? this.active;
    this.popup?.open();
  }

  private typeAhead(key: string) {
    const now = Date.now();
    this.typed = { text: now - this.typed.at < 500 ? this.typed.text + key : key, at: now };
    const from = this.popup?.isOpen() ? this.active : this.options.findIndex((option) => option.value === this.selectedValue());
    const index = matchIndex(this.options, this.typed.text, this.typed.text.length > 1 ? from - 1 : from);
    if (index >= 0) this.show(index);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const open = !!this.popup?.isOpen();
    const move = keyMove(event.key, this.options, this.active);
    if (move !== undefined) {
      event.preventDefault();
      if (!open) return this.show();
      this.active = move;
    } else if (open && (event.key === 'Enter' || event.key === ' ' || event.key === 'Tab')) {
      if (event.key !== 'Tab') event.preventDefault();
      this.select(this.active);
    } else if (open && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.popup?.close();
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.show();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.typeAhead(event.key);
    }
  };

  render() {
    const id = 'control';
    const selected = this.options.find((option) => option.value === this.selectedValue());
    const error = this.error || (this.touched && this.required && !selected ? missingMessage('select') : '');
    return (
      <div class="field">
        <label class="label" id="label" htmlFor={id} part="label">
          {this.label}
          <RequiredMark required={this.required} />
        </label>
        <FieldText id={id} hint={this.hint} error={error} />
        <ComboTrigger
          ref={(el) => (this.trigger = el)}
          open={this.open}
          active={this.active}
          required={this.required}
          disabled={this.disabled}
          error={error}
          describedBy={describedBy({ id, hint: this.hint, error })}
          text={selected?.label ?? this.placeholder}
          isPlaceholder={!selected}
          onKeyDown={this.onKeyDown}
          onClick={() => (this.popup?.isOpen() ? this.popup.close() : this.show())}
        />
        <PopupPanel panelRef={(el) => (this.listbox = el)} part="listbox" animation={this.animation}>
          <div class="list" id="listbox" role="listbox" aria-labelledby="label">
          <OptionList
            options={this.options}
            selected={selected}
            active={this.active}
            open={this.open}
            onHover={(index) => (this.active = index)}
            onPick={(index) => this.select(index)}
          />
          </div>
        </PopupPanel>
      </div>
    );
  }
}
