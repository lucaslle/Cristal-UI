import { AttachInternals, Build, Component, Element, Event, EventEmitter, Listen, Prop, State, h } from '@stencil/core';
import { FieldText, RequiredMark, ErrorAnimation } from '../../utils/field';
import { t } from '../../utils/i18n';
import { ListOption, readOptions, watchOptions } from '../../utils/listbox';
import { handleInvalid } from '../../utils/validation';

/**
 * Choix d'une seule option dans une liste de boutons radio empilés, sous un titre visible.
 * Les options sont des éléments option enfants. Le point du bouton choisi coule jusqu'au nouveau choix.
 * @part label - Le titre du groupe.
 * @part option - Une option.
 * @part error - Le message d'erreur.
 */
@Component({
  tag: 'cr-radio-group',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-radio-group.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrRadioGroup {
  @Element() el!: HTMLCrRadioGroupElement;
  @AttachInternals() internals: ElementInternals;

  /** Titre affiché au-dessus des options, et nom du groupe pour les lecteurs d'écran. */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur de l'option choisie ; aucune par défaut. */
  @Prop({ mutable: true }) value = '';
  /** Rend le choix obligatoire. */
  @Prop({ reflect: true }) required = false;
  /** Désactive le groupe. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';

  /** Émis quand l'option choisie change ; detail : sa valeur. */
  @Event() crChange: EventEmitter<string>;

  @State() options: ListOption[] = [];
  @State() touched = false;

  private group?: HTMLElement;
  private dot?: HTMLElement;
  private unwatch?: () => void;
  private resize?: ResizeObserver;
  private initial = '';
  private focusChecked = false;

  @Listen('invalid')
  onInvalid(event: Event) {
    this.touched = true;
    handleInvalid(event, this.el, this.group?.querySelector<HTMLElement>('[tabindex="0"]') ?? undefined);
  }

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, (options) => (this.options = options));
  }

  componentWillLoad() {
    this.options = readOptions(this.el);
    this.initial = this.value;
  }

  disconnectedCallback() {
    this.unwatch?.();
    this.resize?.disconnect();
    this.resize = undefined;
  }

  componentDidRender() {
    const missing = this.required && !this.value;
    this.internals.setFormValue(this.value || null);
    this.internals.setValidity({ valueMissing: missing }, missing ? t(this.el).radio : '', this.group?.querySelector<HTMLElement>('[tabindex="0"]') ?? undefined);
    if (!Build.isBrowser || !this.group) return;
    this.place();
    if (!this.resize) {
      this.resize = new ResizeObserver(() => this.place());
      this.resize.observe(this.group);
      this.el.setAttribute('data-ready', '');
    }
    if (this.focusChecked) this.group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    this.focusChecked = false;
  }

  formResetCallback() {
    this.value = this.initial;
    this.touched = false;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** Le point s'étend par le bord qui va vers la nouvelle option, puis l'autre bord le rejoint (délais dans le CSS). */
  private place() {
    const circle = this.group?.querySelector<HTMLElement>('[aria-checked="true"] .circle');
    const dot = this.dot;
    if (!dot || !this.group) return;
    if (!circle) return dot.removeAttribute('data-on');
    const size = dot.offsetWidth;
    const top = circle.offsetTop + (circle.offsetHeight - size) / 2;
    const first = !dot.hasAttribute('data-on');
    dot.dataset.direction = top > dot.offsetTop ? 'down' : 'up';
    if (first) dot.style.transition = 'none';
    Object.assign(dot.style, { top: `${top}px`, bottom: `${this.group.clientHeight - top - size}px`, left: `${circle.offsetLeft + (circle.offsetWidth - size) / 2}px` });
    if (first) {
      void dot.offsetWidth;
      dot.style.removeProperty('transition');
      dot.setAttribute('data-on', '');
    }
  }

  private select(value: string) {
    if (this.disabled || value === this.value) return;
    this.value = value;
    this.crChange.emit(value);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[event.key];
    const enabled = this.options.filter((option) => !option.disabled);
    if (!step || !enabled.length || this.disabled) return;
    event.preventDefault();
    const index = Math.max(0, enabled.findIndex((option) => option.value === this.value));
    this.focusChecked = true;
    this.select(enabled[(index + step + enabled.length) % enabled.length].value);
  };

  render() {
    const enabled = this.options.filter((option) => !option.disabled);
    const focusable = enabled.some((option) => option.value === this.value) ? this.value : enabled[0]?.value;
    const error = this.touched && this.required && !this.value ? t(this.el).radio : '';
    return (
      <div class="field">
        <span class="label" id="label" part="label">
          {this.label}
          <RequiredMark required={this.required} />
        </span>
        <div
          class="group error-frame"
          role="radiogroup"
          aria-labelledby="label"
          aria-required={this.required ? 'true' : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'group-error' : undefined}
          aria-disabled={this.disabled ? 'true' : undefined}
          ref={(el) => (this.group = el)}
          onKeyDown={this.onKeyDown}
        >
          <span class="dot" aria-hidden="true" ref={(el) => (this.dot = el)} />
          {this.options.map((option) => (
            <button
              type="button"
              role="radio"
              class="option"
              part="option"
              aria-checked={option.value === this.value ? 'true' : 'false'}
              tabIndex={option.value === focusable ? 0 : -1}
              disabled={this.disabled || option.disabled}
              onClick={() => this.select(option.value)}
            >
              <span class="circle" />
              {option.label}
            </button>
          ))}
        </div>
        <FieldText id="group" error={error} animation={this.errorAnimation} />
      </div>
    );
  }
}
