import { Build, Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

type Panel = HTMLElement & { label?: string };

/**
 * Onglets : une barre d'onglets et le panneau de l'onglet choisi. Chaque onglet est un enfant cr-tab-panel.
 * Un trait glisse sous l'onglet choisi, et le contenu arrive du côté de l'onglet choisi.
 * @slot - Les cr-tab-panel.
 * @part tablist - La barre d'onglets.
 * @part tab - Un onglet.
 * @part indicator - Le trait sous l'onglet choisi.
 * @part panel - La zone du panneau affiché.
 */
@Component({
  tag: 'cr-tabs',
  styleUrl: 'cr-tabs.css',
  shadow: true,
})
export class CrTabs {
  @Element() el!: HTMLCrTabsElement;

  /** Index de l'onglet choisi, à partir de 0. */
  @Prop({ mutable: true }) selected = 0;

  /** Émis quand l'onglet choisi change ; detail : son index. */
  @Event() crChange: EventEmitter<number>;

  @State() labels: string[] = [];
  @State() direction?: 'next' | 'prev';

  private tablist?: HTMLElement;
  private indicator?: HTMLElement;
  private observer?: MutationObserver;
  private resize?: ResizeObserver;
  private focusSelected = false;

  connectedCallback() {
    if (!Build.isBrowser) return;
    this.observer = new MutationObserver(() => (this.labels = this.panels().map(this.labelOf)));
    this.observer.observe(this.el, { childList: true, subtree: true, attributes: true, attributeFilter: ['label'] });
  }

  componentWillLoad() {
    this.labels = this.panels().map(this.labelOf);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.resize?.disconnect();
    this.resize = undefined;
  }

  @Watch('selected')
  selectedChanged(next: number, previous: number) {
    this.direction = next > previous ? 'next' : 'prev';
  }

  componentDidRender() {
    if (!Build.isBrowser || !this.tablist) return;
    this.place();
    if (!this.resize) {
      this.resize = new ResizeObserver(() => this.place());
      this.resize.observe(this.tablist);
      // Une image plus tard : la première position est posée sans glissement.
      requestAnimationFrame(() => this.el.setAttribute('data-ready', ''));
    }
    if (this.focusSelected) this.tablist.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
    this.focusSelected = false;
  }

  private panels = () => Array.from(this.el.children).filter((child): child is Panel => child.tagName === 'CR-TAB-PANEL');

  private labelOf = (panel: Panel) => panel.label ?? panel.getAttribute('label') ?? '';

  private current = () => Math.max(0, Math.min(this.selected, this.labels.length - 1));

  private place() {
    const tab = this.tablist?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (tab && this.indicator) Object.assign(this.indicator.style, { transform: `translateX(${tab.offsetLeft}px)`, width: `${tab.offsetWidth}px` });
  }

  private select(index: number) {
    if (index === this.current()) return;
    this.selected = index;
    this.crChange.emit(index);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const count = this.labels.length;
    const index = this.current();
    const target = ({ ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: count - 1 } as Record<string, number>)[event.key];
    if (target === undefined || !count) return;
    event.preventDefault();
    this.focusSelected = true;
    this.select((target + count) % count);
  };

  render() {
    const current = this.current();
    return [
      // Masque les autres panneaux depuis le shadow DOM : le rendu serveur les cache déjà, sans toucher aux enfants.
      <style>{`::slotted(:not(:nth-of-type(${current + 1}))) { display: none; }`}</style>,
      <div class="tablist" role="tablist" part="tablist" ref={(el) => (this.tablist = el)} onKeyDown={this.onKeyDown}>
        <span class="indicator" part="indicator" ref={(el) => (this.indicator = el)} />
        {this.labels.map((label, index) => (
          <button
            type="button"
            role="tab"
            class="tab"
            part="tab"
            id={`tab-${index}`}
            aria-selected={index === current ? 'true' : 'false'}
            aria-controls="panel"
            tabIndex={index === current ? 0 : -1}
            onClick={() => this.select(index)}
          >
            {label}
          </button>
        ))}
      </div>,
      <div key={current} class="panel" part="panel" role="tabpanel" id="panel" aria-labelledby={`tab-${current}`} tabIndex={0} data-direction={this.direction}>
        <slot />
      </div>,
    ];
  }
}
