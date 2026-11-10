import { Component, Element, Listen, Prop, State, Watch, forceUpdate, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { AccordionAnimation, AccordionVariant } from '../../utils/accordion';
import { reducedMotion } from '../../utils/popup';

const MOVES: Record<string, (current: number, count: number) => number> = {
  ArrowDown: (current) => current + 1,
  ArrowRight: (current) => current + 1,
  ArrowUp: (current) => current - 1,
  ArrowLeft: (current) => current - 1,
  Home: () => 0,
  End: (_, count) => count - 1,
};

/**
 * Accordéon : sections cr-accordion-item qui s'ouvrent et se ferment.
 * @slot - Les sections cr-accordion-item.
 * @part toggle-all - Le bouton « Tout ouvrir / Tout fermer ».
 */
@Component({
  tag: 'cr-accordion',
  styleUrl: 'cr-accordion.css',
  shadow: true,
})
export class CrAccordion {
  @Element() el!: HTMLElement;

  /** Permet d'ouvrir plusieurs sections à la fois. */
  @Prop() multiple = false;
  /** Présentation : liste ou panneaux côte à côte (panels). */
  @Prop({ reflect: true }) variant: AccordionVariant = 'list';
  /** Animation d'ouverture : slide, accent-bar (barre qui pousse sur le côté) ou cascade (le contenu arrive ligne par ligne). */
  @Prop() animation: AccordionAnimation = 'slide';
  /** Numérote les sections (01, 02…). */
  @Prop() numbered = false;
  /** Ajoute un bouton « Tout ouvrir / Tout fermer » : les sections s'ouvrent l'une après l'autre, et se ferment dans l'ordre inverse. */
  @Prop() toggleAll = false;
  /** Niveau de titre des en-têtes (2 à 6). */
  @Prop() headingLevel = 3;

  @State() allOpen = false;

  private items = () => Array.from(this.el.children).filter((child): child is HTMLCrAccordionItemElement => child.tagName === 'CR-ACCORDION-ITEM');

  @Watch('variant')
  @Watch('animation')
  @Watch('numbered')
  @Watch('headingLevel')
  refresh() {
    this.items().forEach((item) => forceUpdate(item));
    this.allOpen = this.items().every((item) => item.open || item.disabled);
  }

  componentDidLoad() {
    this.refresh();
    this.openFirstPanel();
  }

  /** Panneaux : il y a toujours un panneau ouvert, le premier par défaut. */
  @Watch('variant')
  async openFirstPanel() {
    if (this.variant !== 'panels') return;
    await customElements.whenDefined('cr-accordion-item');
    const items = this.items();
    const first = items.find((item) => !item.disabled);
    if (!first || items.some((item) => item.open)) return;
    // Ouvert d'emblée, sans transition : rien ne bouge au chargement.
    first.dataset.instant = '';
    first.open = true;
    requestAnimationFrame(() => requestAnimationFrame(() => delete first.dataset.instant));
  }

  @Listen('crToggle')
  onToggle(event: CustomEvent<boolean>) {
    const item = event.target as HTMLCrAccordionItemElement;
    if (item.parentElement !== this.el) return;
    if (event.detail && !this.multiple && !this.toggleAll) this.items().forEach((other) => other !== item && other.open && (other.open = false));
    this.allOpen = this.items().every((other) => other.open || other.disabled);
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {
    const origin = event.composedPath()[0] as Element;
    const move = MOVES[event.key];
    if (!move || origin?.getAttribute?.('part') !== 'header') return;
    const items = this.items().filter((item) => !item.disabled);
    const current = items.indexOf((origin.getRootNode() as ShadowRoot).host as HTMLCrAccordionItemElement);
    if (current < 0) return;
    event.preventDefault();
    items[(move(current, items.length) + items.length) % items.length].focus();
  }

  private setAll(open: boolean) {
    const items = this.items().filter((item) => !item.disabled && item.open !== open);
    if (!open) items.reverse();
    const step = reducedMotion() ? 0 : 90;
    items.forEach((item, i) => setTimeout(() => (item.open = open), i * step));
  }

  render() {
    return [
      this.toggleAll && (
        <div class="toolbar">
          <button class="toggle-all" part="toggle-all" type="button" onClick={() => this.setAll(!this.allOpen)}>
            {this.allOpen ? t(this.el).closeAll : t(this.el).openAll}
          </button>
        </div>
      ),
      <div class="items">
        <slot onSlotchange={() => this.refresh()} />
      </div>,
    ];
  }
}
