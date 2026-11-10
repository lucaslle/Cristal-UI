import { Build, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { Control } from '../../utils/button-control';
import { t } from '../../utils/i18n';
import { Chevron, pageHref, pageRange } from '../../utils/pagination';

/**
 * Pagination : page précédente, numéros de pages (avec « … » quand il y en a beaucoup) et page suivante.
 * Avec href, chaque numéro est un vrai lien : Ctrl/Cmd+clic, clic molette et « Ouvrir dans un nouvel onglet » restent natifs.
 * Sans href, ce sont des boutons et crChange donne la page choisie. La pastille de la page courante glisse jusqu'au nouveau numéro.
 * @part page - Un numéro de page.
 * @part previous - Le lien ou bouton « Page précédente ».
 * @part next - Le lien ou bouton « Page suivante ».
 * @part thumb - La pastille qui glisse sous la page courante.
 */
@Component({
  tag: 'cr-pagination',
  styleUrl: 'cr-pagination.css',
  shadow: true,
})
export class CrPagination {
  @Element() el!: HTMLCrPaginationElement;

  /** Page courante, à partir de 1. */
  @Prop({ mutable: true }) page = 1;
  /** Nombre de pages. */
  @Prop() total = 1;
  /** Adresse des pages, où {page} est remplacé par le numéro (« /produits?page={page} ») : les pages deviennent des liens. */
  @Prop() href?: string;

  /** Émis au choix d'une page, sans href ; detail : le numéro de la page. */
  @Event() crChange: EventEmitter<number>;

  private list?: HTMLElement;
  private thumb?: HTMLElement;
  private resize?: ResizeObserver;
  private focusCurrent = false;

  disconnectedCallback() {
    this.resize?.disconnect();
    this.resize = undefined;
  }

  componentDidRender() {
    if (!Build.isBrowser || !this.list) return;
    this.place();
    if (!this.resize) {
      this.resize = new ResizeObserver(() => this.place());
      this.resize.observe(this.list);
      // Une image plus tard : la première position est posée sans glissement.
      requestAnimationFrame(() => this.el.setAttribute('data-ready', ''));
    }
    if (this.focusCurrent) this.list.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    this.focusCurrent = false;
  }

  private current = () => Math.min(Math.max(1, Math.round(this.page)), Math.max(1, this.total));

  private place() {
    const current = this.list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (current && this.thumb) Object.assign(this.thumb.style, { transform: `translate(${current.offsetLeft}px, ${current.offsetTop}px)`, width: `${current.offsetWidth}px` });
  }

  private select(page: number, fromArrow = false) {
    if (page === this.current()) return;
    this.page = page;
    this.crChange.emit(page);
    // La flèche qui devient inactive perdrait le focus : il passe sur la nouvelle page.
    this.focusCurrent = fromArrow && (page === 1 || page === this.total);
  }

  private link(page: number, content: unknown, attributes: Record<string, unknown>, disabled = false) {
    const href = this.href === undefined ? undefined : pageHref(this.href, page);
    return (
      <Control href={href} disabled={disabled} loading={false} onClick={href === undefined ? () => this.select(page, attributes.part !== 'page') : undefined} {...attributes}>
        {content}
      </Control>
    );
  }

  render() {
    const m = t(this.el);
    const page = this.current();
    const total = Math.max(1, this.total);
    return (
      <nav aria-label={m.pagination}>
        <div class="track" ref={(el) => (this.list = el)}>
          <span class="thumb" part="thumb" ref={(el) => (this.thumb = el)} />
          <ul class="list">
            <li>{this.link(page - 1, <Chevron previous />, { class: 'item', part: 'previous', 'aria-label': m.previousPage }, page <= 1)}</li>
            {pageRange(page, total).map((item, index) =>
              item === 'gap' ? (
                <li key={`gap-${index}`} class="gap" aria-hidden="true">
                  …
                </li>
              ) : (
                <li key={item}>
                  {this.link(item, item, { class: { item: true, current: item === page }, part: 'page', 'aria-label': m.pageNumber(item), 'aria-current': item === page ? 'page' : undefined })}
                </li>
              ),
            )}
            <li>{this.link(page + 1, <Chevron />, { class: 'item', part: 'next', 'aria-label': m.nextPage }, page >= total)}</li>
          </ul>
        </div>
      </nav>
    );
  }
}
