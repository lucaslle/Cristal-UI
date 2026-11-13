import { Build, Component, Element, Event, EventEmitter, Listen, Prop, State, Watch, h } from '@stencil/core';
import { CommandList } from '../../utils/command-list';
import { t } from '../../utils/i18n';
import { ListOption, readOptions, watchOptions } from '../../utils/listbox';
import { releaseScroll, syncDialog } from '../../utils/overlay';
import { firstEnabled, moveWithin, visibleIndices } from '../../utils/selection';

/** Élément qui a le focus, en descendant dans les shadow roots. */
const focused = () => {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element as HTMLElement | null;
};

/**
 * Palette de commandes : une fenêtre modale avec un champ qui filtre une liste de commandes (motif combobox).
 * Les commandes sont des éléments option enfants ; data-group les range sous un titre de groupe.
 * Ctrl+K (⌘K sur Mac) l'ouvre de n'importe où dans la page. Haut et Bas parcourent les commandes, Entrée choisit, Échap ferme.
 * La fenêtre tombe en place avec un ressort, et le surlignage de la commande active glisse d'une ligne à l'autre.
 * @part dialog - L'élément dialog.
 * @part input - Le champ de recherche.
 * @part listbox - La liste des commandes.
 * @part option - Une commande.
 * @part group - Un titre de groupe.
 * @part match - Les lettres qui correspondent à la recherche.
 */
@Component({
  tag: 'cr-command-palette',
  styleUrls: ['../../global/overlay.css', 'cr-command-palette.css'],
  shadow: true,
})
export class CrCommandPalette {
  @Element() el!: HTMLCrCommandPaletteElement;

  /** Ouvre ou ferme la palette. */
  @Prop({ mutable: true, reflect: true }) open = false;
  /** Nom de la fenêtre et du champ pour les lecteurs d'écran (« Palette de commandes »). */
  @Prop() label!: string;
  /** Texte indicatif du champ (« Rechercher… » par défaut). */
  @Prop() placeholder?: string;
  /** Ouvre la palette avec Ctrl+K (⌘K sur Mac), où que soit le focus dans la page. */
  @Prop() shortcut = true;

  /** Émis au choix d'une commande, juste avant la fermeture ; detail : sa valeur. */
  @Event() crSelect: EventEmitter<string>;
  /** Émis à chaque fermeture : Échap, choix d'une commande, clic hors de la fenêtre ou open à false. */
  @Event() crClose: EventEmitter<void>;

  @State() options: ListOption[] = [];
  @State() query = '';
  @State() active = -1;

  private dialog?: HTMLDialogElement;
  private input?: HTMLInputElement;
  private listbox?: HTMLElement;
  private thumb?: HTMLElement;
  private returnTo?: HTMLElement | null;
  private unwatch?: () => void;

  connectedCallback() {
    if (Build.isBrowser) this.unwatch = watchOptions(this.el, (options) => (this.options = options));
  }

  componentWillLoad() {
    this.options = readOptions(this.el);
  }

  componentDidLoad() {
    this.openChanged();
  }

  disconnectedCallback() {
    this.unwatch?.();
    if (this.dialog?.open) releaseScroll();
  }

  @Listen('keydown', { target: 'document' })
  onShortcut(event: KeyboardEvent) {
    if (!this.shortcut || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    this.open = true;
  }

  @Watch('open')
  openChanged() {
    if (this.open && !this.dialog?.open) {
      this.returnTo = focused();
      this.setQuery('');
      this.listbox?.removeAttribute('data-ready');
    }
    syncDialog(this.dialog, this.open);
    if (this.open) this.input?.focus();
  }

  componentDidRender() {
    const option = this.listbox?.querySelector<HTMLElement>('[data-active]');
    if (!this.thumb || !this.listbox) return;
    this.thumb.hidden = !option;
    if (!option) return;
    Object.assign(this.thumb.style, { transform: `translateY(${option.offsetTop}px)`, height: `${option.offsetHeight}px` });
    option.scrollIntoView?.({ block: 'nearest' });
    // Une image plus tard : la première position de chaque ouverture est posée sans glissement.
    if (this.open && !this.listbox.hasAttribute('data-ready')) requestAnimationFrame(() => this.listbox?.setAttribute('data-ready', ''));
  }

  private visible = () => visibleIndices(this.options, this.query);

  private setQuery(query: string) {
    this.query = query;
    this.active = firstEnabled(this.options, this.visible());
  }

  private pick(index: number) {
    const option = this.options[index];
    if (!option || option.disabled) return;
    this.crSelect.emit(option.value);
    this.open = false;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.active = moveWithin(event.key, this.options, this.visible(), this.active) ?? this.active;
    } else if (event.key === 'Enter' && this.active >= 0) {
      event.preventDefault();
      this.pick(this.active);
    }
  };

  private onClose = () => {
    releaseScroll();
    this.open = false;
    this.crClose.emit();
    this.returnTo?.focus();
  };

  render() {
    const m = t(this.el);
    const visible = this.visible();
    const empty = !visible.length;
    return (
      <dialog
        ref={(el) => (this.dialog = el)}
        class="dialog"
        part="dialog"
        aria-label={this.label}
        onClose={this.onClose}
        onClick={(event) => event.target === this.dialog && (this.open = false)}
      >
        <div class="search">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5L20 20" />
          </svg>
          <input
            ref={(el) => (this.input = el)}
            part="input"
            type="text"
            role="combobox"
            aria-label={this.label}
            aria-expanded={empty ? 'false' : 'true'}
            aria-controls="listbox"
            aria-autocomplete="list"
            aria-activedescendant={this.active >= 0 && !empty ? `option-${this.active}` : undefined}
            autocomplete="off"
            spellcheck={false}
            placeholder={this.placeholder ?? m.searchPlaceholder}
            value={this.query}
            onInput={(event) => this.setQuery((event.target as HTMLInputElement).value)}
            onKeyDown={this.onKeyDown}
          />
        </div>
        <div class="list" id="listbox" part="listbox" role="listbox" aria-label={this.label} hidden={empty} ref={(el) => (this.listbox = el)}>
          <span class="thumb" aria-hidden="true" ref={(el) => (this.thumb = el)} />
          <CommandList options={this.options} visible={visible} active={this.active} query={this.query} onHover={(index) => (this.active = index)} onPick={(index) => this.pick(index)} />
        </div>
        <div role="status">
          {empty && this.open && (
            <cr-empty-state class="empty" illustration="search" heading={m.noResultsFor(this.query)}>
              {m.noResultsHint}
            </cr-empty-state>
          )}
        </div>
      </dialog>
    );
  }
}
