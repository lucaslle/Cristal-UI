import { AttachInternals, Build, Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { ListOption, watchOptions } from '../../utils/listbox';
import { countUp, readSegments, tabPanels } from '../../utils/segmented-segments';
import { segmentRole, tabPanel } from '../../utils/segmented-tabs';

/**
 * Choix d'une option parmi quelques-unes, côte à côte (Jour, Semaine, Mois…). Les options sont des éléments option enfants ;
 * data-count sur une option ajoute un compteur, qui compte et rebondit quand on choisit l'option.
 * Avec des enfants cr-tab-panel à la place, le contrôle devient des onglets : chaque panneau donne un onglet,
 * seul le panneau choisi est affiché et il arrive du côté du changement.
 * @slot - Les cr-tab-panel, en mode onglets.
 * @part segment - Un segment (un onglet en mode onglets).
 * @part thumb - La pastille (ou le trait) qui glisse sous le segment choisi ; absente avec variant clip.
 * @part panel - La zone du panneau affiché, en mode onglets.
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

  /** Nom lu par les lecteurs d'écran (le contrôle, ou la barre d'onglets, n'a pas de libellé visible). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire ; sans effet en mode onglets. */
  @Prop({ reflect: true }) name?: string;
  /**
   * Valeur de l'option choisie ; la première option disponible par défaut.
   * En mode onglets : value du cr-tab-panel choisi, ou à défaut sa position en texte ("0", "1"…).
   */
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

  /** Émis quand l'option (ou l'onglet) choisie change ; detail : sa valeur. */
  @Event() crChange: EventEmitter<string>;

  @State() options: ListOption[] = [];
  /** Nombre affiché pendant que le compteur de l'option choisie compte. */
  @State() counting?: number;
  @State() direction?: 'next' | 'prev';

  private group?: HTMLElement;
  private thumb?: HTMLElement;
  private overlay?: HTMLElement;
  private unwatch?: () => void;
  private resize?: ResizeObserver;
  private stopCount?: () => void;
  private initial = '';
  private focusChecked = false;

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, (options) => (this.options = options), readSegments);
  }

  componentWillLoad() {
    this.options = readSegments(this.el);
    this.initial = this.value;
  }

  disconnectedCallback() {
    this.unwatch?.();
    this.resize?.disconnect();
    this.resize = undefined;
    this.stopCount?.();
  }

  @Watch('value')
  valueChanged(next: string, previous: string) {
    const index = (value: string) => this.options.findIndex((option) => option.value === value);
    this.direction = index(next) > index(previous) ? 'next' : 'prev';
  }

  componentDidRender() {
    this.internals.setFormValue(this.tabs() ? null : this.selected());
    if (!Build.isBrowser || !this.group) return;
    this.place();
    if (!this.resize) {
      this.resize = new ResizeObserver(() => this.place());
      this.resize.observe(this.group);
      // Une image plus tard : la première position est posée sans glissement.
      requestAnimationFrame(() => this.el.setAttribute('data-ready', ''));
    }
    if (this.focusChecked) this.group.querySelector<HTMLElement>('button.checked')?.focus();
    this.focusChecked = false;
  }

  formResetCallback() {
    if (!this.tabs()) this.value = this.initial;
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private tabs = () => tabPanels(this.el).length > 0;

  private selected = () => this.value || (this.options.find((option) => !option.disabled)?.value ?? '');

  private place() {
    const button = this.group?.querySelector<HTMLElement>('button.checked');
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
    this.stopCount?.();
    this.counting = undefined;
    const count = Number(this.options.find((option) => option.value === value)?.count);
    if (!Number.isFinite(count) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.stopCount = countUp(count, (counting) => (this.counting = counting));
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const enabled = this.options.filter((option) => !option.disabled);
    const index = enabled.findIndex((option) => option.value === this.selected());
    // Une barre d'onglets horizontale ne répond qu'aux flèches gauche et droite.
    const vertical = this.tabs() ? {} : { ArrowDown: index + 1, ArrowUp: index - 1 };
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, ...vertical, Home: 0, End: enabled.length - 1 };
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
    const tabs = this.tabs();
    const selected = this.selected();
    // Une valeur inconnue montre le premier onglet : une barre d'onglets sans onglet choisi n'aurait plus d'arrêt de tabulation.
    const current = tabs ? Math.max(0, this.options.findIndex((option) => option.value === selected)) : -1;
    const isChecked = (option: ListOption, index: number) => (tabs ? index === current : option.value === selected);
    return (
      <Host data-tabs={tabs ? '' : undefined}>
        <div class="group" role={tabs ? 'tablist' : 'radiogroup'} aria-label={this.label} aria-disabled={this.disabled ? 'true' : undefined} ref={(el) => (this.group = el)} onKeyDown={this.onKeyDown}>
          {this.variant !== 'clip' && <span class="thumb" part="thumb" ref={(el) => (this.thumb = el)} />}
          {this.options.map((option, index) => {
            const checked = isChecked(option, index);
            return (
              <button
                type="button"
                {...segmentRole(tabs, index, checked)}
                class={{ segment: true, checked }}
                part="segment"
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
              {this.options.map((option, index) => (
                <span class="segment" data-checked={isChecked(option, index) ? '' : undefined}>
                  {this.content(option, isChecked(option, index))}
                </span>
              ))}
            </div>
          )}
        </div>
        {tabs && tabPanel(current, this.direction)}
      </Host>
    );
  }
}
