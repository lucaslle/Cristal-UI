import { AttachInternals, Build, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldHeader, describedBy } from '../../utils/field';
import { ListOption, readOptions, revealInList, watchOptions } from '../../utils/listbox';
import { firstEnabled, formValue, summary, toggle, visibleIndices } from '../../utils/selection';
import { selectKeyboard } from '../../utils/select-keyboard';
import { selectPopup } from '../../utils/select-popup';
import { PopupAnimation } from '../../utils/popup';
import { PopupPanel } from '../../utils/popup-view';
import { ComboTrigger, SelectPanel } from '../../utils/listbox-view';
import { handleInvalid, missingMessage } from '../../utils/validation';
import { t } from '../../utils/i18n';

/**
 * Liste déroulante. Les options sont des éléments option enfants.
 * @part label - Le libellé.
 * @part control - Le bouton qui ouvre la liste.
 * @part listbox - La liste des options.
 * @part option - Une option.
 * @part search - Le champ de recherche (avec searchable).
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
  /** Valeur de l'option sélectionnée (liste simple). */
  @Prop({ mutable: true }) value = '';
  /** Valeurs des options sélectionnées (avec multiple). */
  @Prop({ mutable: true }) values: string[] = [];
  /** Permet de choisir plusieurs options. */
  @Prop() multiple = false;
  /** Ajoute un champ de recherche en haut de la liste. */
  @Prop() searchable = false;
  /** Recherche côté serveur (avec searchable) : pas de filtre local, l'application remplace les options à chaque crSearch. */
  @Prop() remote = false;
  /** Affiche « Recherche en cours… » pendant le chargement des options (avec remote). */
  @Prop() loading = false;
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

  /** Émis quand la sélection change ; detail : la valeur, ou le tableau des valeurs avec multiple. */
  @Event() crChange: EventEmitter<string | string[]>;
  /** Émis 300 ms après la dernière frappe dans la recherche (avec remote) ; detail : le texte recherché. */
  @Event() crSearch: EventEmitter<string>;

  @State() options: ListOption[] = [];
  @State() open = false;
  @State() active = -1;
  @State() touched = false;
  @State() query = '';

  private trigger?: HTMLButtonElement;
  private listbox?: HTMLElement;
  search?: HTMLInputElement;
  private unwatch?: () => void;
  private initial?: string[];
  private labels = new Map<string, string>();
  private keys = selectKeyboard(this);
  private popup = selectPopup(this);

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, this.onOptions);
  }

  private onOptions = (options: ListOption[]) => {
    this.options = options;
    if (this.remote) this.active = firstEnabled(options, this.visible());
  };

  disconnectedCallback() {
    this.unwatch?.();
    this.popup.destroy();
  }

  componentWillLoad() {
    this.options = readOptions(this.el);
  }

  componentDidRender() {
    this.popup.attach(this.listbox, this.trigger);
    const chosen = this.selection();
    this.options.forEach((option) => chosen.includes(option.value) && this.labels.set(option.value, option.label));
    const missing = this.required && !this.selection().length;
    this.internals.setFormValue(formValue(this.name, this.selection(), this.multiple));
    this.internals.setValidity({ valueMissing: missing }, missing ? missingMessage(this.kind(), t(this.el)) : '', this.trigger);
    if (this.open) revealInList(this.listbox?.querySelector<HTMLElement>('[data-active]'));
  }

  formResetCallback() {
    if (this.initial) this.setSelection(this.initial);
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

  private kind = () => (this.multiple ? 'select-multiple' : 'select');

  selection(): string[] {
    if (this.multiple) return this.values;
    const value = this.value || (this.placeholder ? '' : (this.options.find((option) => !option.disabled)?.value ?? ''));
    return value ? [value] : [];
  }

  private setSelection = (next: string[]) => (this.multiple ? (this.values = next) : (this.value = next[0] ?? ''));

  visible = () => (this.searchable && !this.remote ? visibleIndices(this.options, this.query) : [...this.options.keys()]);

  select(index: number) {
    const option = this.options[index];
    if (!option || option.disabled) return;
    this.touched = true;
    const current = this.selection();
    const next = this.multiple ? toggle(current, option.value) : [option.value];
    if (next.join('\n') !== current.join('\n')) {
      this.initial ??= current;
      this.setSelection(next);
      this.crChange.emit(this.multiple ? next : next[0]);
    }
    if (!this.multiple) this.close(this.listbox?.querySelector<HTMLElement>(`#option-${index}`) ?? undefined);
  }

  close = (picked?: HTMLElement) => this.popup.close(picked);
  isOpen = () => this.popup.isOpen();
  show = (index?: number) => this.popup.show(index);
  setQuery = (query: string) => this.keys.setQuery(query);

  render() {
    const id = 'control';
    const selection = this.selection();
    const text = summary(this.options, selection, this.labels);
    const visible = this.visible();
    const error = this.error || (this.touched && this.required && !selection.length ? missingMessage(this.kind(), t(this.el)) : '');
    return (
      <div class="field">
        <FieldHeader id={id} labelId="label" label={this.label} required={this.required} hint={this.hint} error={error} />
        <ComboTrigger
          ref={(el) => (this.trigger = el)}
          open={this.open}
          active={this.searchable ? -1 : this.active}
          required={this.required}
          disabled={this.disabled}
          error={error}
          describedBy={describedBy({ id, hint: this.hint, error })}
          text={text || this.placeholder}
          isPlaceholder={!text}
          onKeyDown={this.keys.onKeyDown}
          onClick={() => (this.isOpen() ? this.close() : this.show())}
        />
        <PopupPanel panelRef={(el) => (this.listbox = el)} part="listbox" animation={this.animation}>
          <SelectPanel
            {...{ options: this.options, visible, selection, multiple: this.multiple, active: this.active, open: this.open, searchable: this.searchable, query: this.query, loading: this.loading, m: t(this.el) }}
            searchRef={(el) => (this.search = el)}
            onQuery={this.setQuery}
            onKeyDown={this.keys.onKeyDown}
            onHover={(index) => (this.active = index)}
            onPick={(index) => this.select(index)}
          />
        </PopupPanel>
      </div>
    );
  }
}
