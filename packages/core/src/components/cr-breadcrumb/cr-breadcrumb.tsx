import { Build, Component, Element, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Fil d'Ariane : le chemin jusqu'à la page courante. Les niveaux sont les enfants, écrits tels quels :
 * des liens a href (Ctrl/Cmd+clic restent natifs), puis la page courante en dernier (un span), marquée aria-current="page".
 * Au-delà de max niveaux, ceux du milieu se replient derrière un bouton « … » ; ils glissent hors de lui quand on le déplie.
 * @slot - Les niveaux : des liens, puis la page courante.
 * @part more - Le bouton « … » qui déplie les niveaux masqués.
 */
@Component({
  tag: 'cr-breadcrumb',
  styleUrl: 'cr-breadcrumb.css',
  shadow: true,
})
export class CrBreadcrumb {
  @Element() el!: HTMLCrBreadcrumbElement;

  /** Nombre de niveaux au-delà duquel ceux du milieu se replient (le premier et les max - 2 derniers restent visibles). */
  @Prop() max = 4;

  @State() items: Element[] = [];
  @State() expanded = false;

  private observer?: MutationObserver;
  private focusRevealed = false;

  connectedCallback() {
    this.read();
    if (!Build.isBrowser) return;
    this.observer = new MutationObserver(() => this.read());
    this.observer.observe(this.el, { childList: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  componentDidRender() {
    if (this.focusRevealed) (this.items[1] as HTMLElement | undefined)?.focus();
    this.focusRevealed = false;
  }

  // Chaque enfant va dans l'élément de liste qui lui revient, et le dernier devient la page courante.
  private read() {
    this.items = Array.from(this.el.children);
    this.items.forEach((item, index) => {
      item.slot = `item-${index}`;
      if (index === this.items.length - 1) item.setAttribute('aria-current', 'page');
      else if (item.getAttribute('aria-current') === 'page') item.removeAttribute('aria-current');
    });
  }

  private expand = () => {
    this.expanded = true;
    this.focusRevealed = true;
  };

  render() {
    const m = t(this.el);
    const count = this.items.length;
    const tail = Math.max(1, this.max - 2);
    const foldable = count > Math.max(this.max, 2);
    const folded = (index: number) => index > 0 && index < count - tail;
    const collapsed = foldable && !this.expanded;
    return (
      <nav aria-label={m.breadcrumb}>
        <ol>
          {this.items.map((_, index) => [
            index === 1 && collapsed && (
              <li class="more">
                <button type="button" part="more" aria-expanded="false" aria-label={m.breadcrumbMore(count - tail - 1)} onClick={this.expand}>
                  …
                </button>
              </li>
            ),
            <li key={index} class={{ revealed: foldable && this.expanded && folded(index) }} hidden={collapsed && folded(index)} style={{ '--i': String(index - 1) }}>
              <slot name={`item-${index}`} />
            </li>,
          ])}
        </ol>
      </nav>
    );
  }
}
