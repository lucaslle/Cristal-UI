import { AttachInternals, Build, Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { ListOption, readOptions, watchOptions } from '../../utils/listbox';

const COUNT_MS = 500;

/**
 * Choix d'une option parmi quelques-unes, côte à côte (Jour, Semaine, Mois…). Les options sont des éléments option enfants ;
 * data-count sur une option ajoute un compteur, qui compte et rebondit quand on choisit l'option.
 * @part segment - Un segment.
 * @part thumb - La pastille (ou le trait) qui glisse sous le segment choisi ; absente avec variant clip.
 */
@Component({
  tag: 'cr-segmented',
  styleUrl: 'cr-segmented.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrSegmented {
  @Element() el!: HTMLCrSegmentedElement;
  @AttachInternals() internals: ElementInternals;

  /** Nom lu par les lecteurs d'écran (le contrôle n'a pas de libellé visible). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Valeur de l'option choisie ; la première option disponible par défaut. */
  @Prop({ mutable: true }) value = '';
  /**
   * Style : thumb (pastille en relief, libellé en gras), clip (pastille colorée, le texte ne devient blanc que là où elle passe),
   * underline (trait qui glisse sous le libellé) ou outline (pastille teintée et cerclée dans un rail bordé).
   */
  @Prop({ reflect: true }) variant: 'thumb' | 'clip' | 'underline' | 'outline' = 'thumb';
  /** Segments à la largeur de leur libellé, la pastille change de largeur en glissant ; sinon largeurs égales. */
  @Prop({ reflect: true }) fit = false;
  /** Désactive le contrôle. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis quand l'option choisie change ; detail : sa valeur. */
  @Event() crChange: EventEmitter<string>;

  @State() options: ListOption[] = [];
  /** Nombre affiché pendant que le compteur de l'option choisie compte. */
  @State() counting?: number;

  private group?: HTMLElement;
  private thumb?: HTMLElement;
  private overlay?: HTMLElement;
  private unwatch?: () => void;
  private resize?: ResizeObserver;
  private frame?: number;
  private initial = '';
  private focusChecked = false;

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
    cancelAnimationFrame(this.frame!);
  }

  componentDidRender() {
    this.internals.setFormValue(this.selected());
    if (!Build.isBrowser || !this.group) return;
    this.place();
    if (!this.resize) {
      this.resize = new ResizeObserver(() => this.place());
      this.resize.observe(this.group);
      // Une image plus tard : la première position est posée sans glissement.
      requestAnimationFrame(() => this.el.setAttribute('data-ready', ''));
    }
    if (this.focusChecked) this.group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    this.focusChecked = false;
  }

  formResetCallback() {
    this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private selected = () => this.value || (this.options.find((option) => !option.disabled)?.value ?? '');

  private place() {
    const button = this.group?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!button || !this.group) return;
    const left = button.offsetLeft;
    const right = this.group.clientWidth - left - button.offsetWidth;
    if (this.thumb) Object.assign(this.thumb.style, { transform: `translateX(${left}px)`, width: `${button.offsetWidth}px` });
    if (this.overlay) this.overlay.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
  }

  private select(value: string) {
    if (this.disabled || value === this.selected()) return;
    this.value = value;
    this.crChange.emit(value);
    cancelAnimationFrame(this.frame!);
    this.counting = undefined;
    const count = Number(this.options.find((option) => option.value === value)?.count);
    if (!Number.isFinite(count) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      this.counting = progress < 1 ? count * (1 - (1 - progress) ** 3) : undefined;
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const enabled = this.options.filter((option) => !option.disabled);
    const index = enabled.findIndex((option) => option.value === this.selected());
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: enabled.length - 1 };
    const target = moves[event.key];
    if (target === undefined || !enabled.length) return;
    event.preventDefault();
    this.focusChecked = true;
    this.select(enabled[(target + enabled.length) % enabled.length].value);
  };

  private content(option: ListOption, checked: boolean) {
    const count = checked && this.counting !== undefined ? Math.round(this.counting) : option.count;
    return [
      <span class="label" data-label={option.label}>
        {option.label}
      </span>,
      option.count !== undefined && <span class="count">{count}</span>,
    ];
  }

  render() {
    const selected = this.selected();
    return (
      <div class="group" role="radiogroup" aria-label={this.label} aria-disabled={this.disabled ? 'true' : undefined} ref={(el) => (this.group = el)} onKeyDown={this.onKeyDown}>
        {this.variant !== 'clip' && <span class="thumb" part="thumb" ref={(el) => (this.thumb = el)} />}
        {this.options.map((option) => {
          const checked = option.value === selected;
          return (
            <button
              type="button"
              role="radio"
              class="segment"
              part="segment"
              aria-checked={checked ? 'true' : 'false'}
              aria-label={option.count !== undefined ? `${option.label} (${option.count})` : undefined}
              tabIndex={checked ? 0 : -1}
              disabled={this.disabled || option.disabled}
              onClick={() => this.select(option.value)}
            >
              {this.content(option, checked)}
            </button>
          );
        })}
        {this.variant === 'clip' && (
          <div class="overlay" aria-hidden="true" ref={(el) => (this.overlay = el)}>
            {this.options.map((option) => (
              <span class="segment" data-checked={option.value === selected ? '' : undefined}>
                {this.content(option, option.value === selected)}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
}
