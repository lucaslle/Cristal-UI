import { AttachInternals, Component, Element, Event, EventEmitter, Listen, Prop, State, Watch, h } from '@stencil/core';
import { CalendarPanel } from '../../utils/calendar-view';
import { addMonths, clampDate, dateForKey, datePattern, dateProblem, formatDate, formatLong, fromIso, monthDirection, parseDate, toIso, today } from '../../utils/date';
import { DateBox } from '../../utils/date-field';
import { FieldHeader, describedBy } from '../../utils/field';
import { t } from '../../utils/i18n';
import { Popup, createPopup } from '../../utils/popup';
import { handleInvalid } from '../../utils/validation';

/**
 * Champ de date : saisie au clavier dans le format de la langue (JJ/MM/AAAA en français, MM/DD/YYYY en anglais),
 * ou choix dans un calendrier ouvert par le bouton voisin. Le calendrier suit le motif Date Picker Dialog de l'APG ;
 * les mois glissent du côté de la navigation et le jour choisi s'affiche avec un petit rebond.
 * @part label - Le libellé.
 * @part control - Le champ de saisie.
 * @part button - Le bouton qui ouvre le calendrier.
 * @part calendar - Le calendrier.
 * @part hint - Le format attendu.
 * @part error - Le message d'erreur.
 */
@Component({
  tag: 'cr-date-picker',
  styleUrls: ['../../global/field.css', '../../global/popup.css', 'cr-date-picker.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrDatePicker {
  @Element() el!: HTMLCrDatePickerElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus du champ (obligatoire). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Date choisie, au format ISO AAAA-MM-JJ ; chaîne vide sans date. */
  @Prop({ mutable: true }) value = '';
  /** Première date possible, au format ISO AAAA-MM-JJ. */
  @Prop() min?: string;
  /** Dernière date possible, au format ISO AAAA-MM-JJ. */
  @Prop() max?: string;
  /** Rend la date obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le champ et le calendrier. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand la date change (choix dans le calendrier, ou champ quitté après saisie) ; detail : la date ISO, ou une chaîne vide. */
  @Event() crChange: EventEmitter<string>;

  @State() text = '';
  @State() open = false;
  @State() focused = today();
  @State() direction?: 'next' | 'prev';
  @State() touched = false;

  private input?: HTMLInputElement;
  private toggle?: HTMLButtonElement;
  private panel?: HTMLElement;
  private popup?: Popup;
  private initialValue?: string;
  private valueBeforeTyping?: string;
  private focusDay = false;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.input);
  }

  // Une valeur posée de l'extérieur réécrit le champ ; celle qui vient de la saisie le laisse tel quel.
  @Watch('value')
  valueChanged(next: string) {
    if (toIso(parseDate(this.locale(), this.text)) !== next) this.text = formatDate(this.locale(), fromIso(next));
  }

  componentWillLoad() {
    this.text = formatDate(this.locale(), fromIso(this.value));
  }

  componentDidLoad() {
    const onClose = () => {
      if (this.panel!.contains(this.el.shadowRoot!.activeElement)) this.toggle?.focus();
      this.open = false;
    };
    this.popup = createPopup({ popup: this.panel!, anchor: this.input!.parentElement!, host: this.el, onOpen: () => undefined, onClose });
  }

  componentDidRender() {
    const [flag, message] = this.problem();
    this.internals.setFormValue(this.value || null);
    this.internals.setValidity(flag ? { [flag]: true } : {}, message, this.input);
    if (this.open && !this.popup?.isOpen()) {
      delete this.panel!.dataset.picked;
      this.popup?.open();
      this.focusDay = true;
    }
    if (this.focusDay) this.panel?.querySelector<HTMLElement>('.day[tabindex="0"]')?.focus();
    this.focusDay = false;
  }

  disconnectedCallback() {
    this.popup?.destroy();
  }

  formResetCallback() {
    if (this.initialValue !== undefined) this.value = this.initialValue;
    this.text = formatDate(this.locale(), fromIso(this.value));
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private locale = () => t(this.el).locale;
  private bounds = () => [fromIso(this.min), fromIso(this.max)] as const;
  private problem = () => dateProblem(this.text, this.locale(), t(this.el), this.required, ...this.bounds());

  private onInput = (event: Event) => {
    this.text = (event.target as HTMLInputElement).value;
    this.valueBeforeTyping ??= this.value;
    this.initialValue ??= this.value;
    this.value = toIso(parseDate(this.locale(), this.text));
  };

  private onChange = () => {
    this.touched = true;
    this.text = formatDate(this.locale(), parseDate(this.locale(), this.text)) || this.text;
    if (this.valueBeforeTyping !== undefined && this.valueBeforeTyping !== this.value) this.crChange.emit(this.value);
    this.valueBeforeTyping = undefined;
  };

  private show = () => {
    this.focused = clampDate(fromIso(this.value) ?? today(), ...this.bounds());
    this.direction = undefined;
    this.open = true;
  };

  private move(date: Date) {
    const next = clampDate(date, ...this.bounds());
    this.direction = monthDirection(this.focused, next) ?? this.direction;
    this.focused = next;
  }

  private pick = (date: Date) => {
    this.text = formatDate(this.locale(), date);
    this.touched = true;
    if (toIso(date) !== this.value) {
      this.initialValue ??= this.value;
      this.value = toIso(date);
      this.crChange.emit(this.value);
    }
    // Le calendrier attend la fin du rebond du jour choisi avant de se refermer (délai dans le CSS).
    this.panel!.dataset.picked = '';
    this.popup?.close();
  };

  private onGridKeyDown = (event: KeyboardEvent) => {
    const target = dateForKey(event.key, this.focused, event.shiftKey, t(this.el).firstDay);
    if (!target) return;
    event.preventDefault();
    this.move(target);
    this.focusDay = true;
  };

  render() {
    const m = t(this.el);
    const locale = this.locale();
    const [min, max] = this.bounds();
    const hint = m.dateHint(datePattern(locale, m.dateLetters));
    const error = this.touched ? this.problem()[1] : '';
    const selected = fromIso(this.value);
    return (
      <div class="field">
        <FieldHeader id="control" label={this.label} required={this.required} hint={hint} error={error} />
        <DateBox
          {...{ text: this.text, required: this.required, disabled: this.disabled, open: this.open, error }}
          inputRef={(el) => (this.input = el)}
          toggleRef={(el) => (this.toggle = el)}
          describedBy={describedBy({ id: 'control', hint, error })}
          toggleLabel={selected ? m.dateChange(formatLong(locale, selected)) : m.dateChoose}
          onInput={this.onInput}
          onChange={this.onChange}
          onEnter={() => (this.onChange(), this.internals.form?.requestSubmit())}
          onToggle={() => (this.popup?.isOpen() ? this.popup.close() : this.show())}
        />
        <CalendarPanel
          {...{ focused: this.focused, selected, min, max, locale, m, direction: this.direction, toggle: this.toggle }}
          panelRef={(el) => (this.panel = el)}
          onClose={() => this.popup?.close()}
          onMonth={(step) => this.move(addMonths(this.focused, step))}
          onPick={this.pick}
          onGridKeyDown={this.onGridKeyDown}
        />
      </div>
    );
  }
}
