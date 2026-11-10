import { AttachInternals, Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { ClockIcon, MorphIcon, NoResults, flyTo } from '../../utils/search-views';

const ROLL_MS = 1000;
/** Au plus 4 changements de mot (moins de 5 s) : un défilement sans fin gênerait la lecture (RGAA 13.8). */
const MAX_ROLLS = 4;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Champ de recherche. En entrant dans le champ, la loupe devient une flèche qui efface la recherche.
 * Options : mots qui défilent dans le texte indicatif, recherches récentes en puces, état « aucun résultat ».
 * @slot - Les résultats, affichés sous le champ.
 * @part control - Le champ.
 * @part icon - Le bouton loupe / flèche.
 * @part chip - Une recherche récente.
 * @part empty - L'état « aucun résultat ».
 */
@Component({
  tag: 'cr-search',
  styleUrl: 'cr-search.css',
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrSearch {
  @Element() el!: HTMLCrSearchElement;
  @AttachInternals() internals: ElementInternals;

  /** Nom du champ lu par les lecteurs d'écran (le champ n'a pas de libellé visible). */
  @Prop() label!: string;
  /** Nom envoyé avec le formulaire. */
  @Prop({ reflect: true }) name?: string;
  /** Texte recherché. */
  @Prop({ mutable: true }) value = '';
  /** Texte indicatif affiché quand le champ est vide (« Rechercher »). */
  @Prop() placeholder?: string;
  /** Mots qui défilent après le texte indicatif, un par seconde (« Rechercher chaussures », puis « sacs »…), au plus quatre fois. */
  @Prop() placeholderWords?: string[];
  /** Recherches récentes, en puces sous le champ vide ; un clic fait voler la puce dans le champ. */
  @Prop() recent?: string[];
  /** Affiche l'état « aucun résultat » pour le texte recherché. */
  @Prop() noResults = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;

  /** Émis à chaque frappe, au choix d'une recherche récente et à l'effacement ; detail : le texte. */
  @Event() crInput: EventEmitter<string>;
  /** Émis sur Entrée ; detail : le texte. Le formulaire parent est aussi envoyé. */
  @Event() crSubmit: EventEmitter<string>;

  @State() focused = false;
  @State() word = 0;

  private root?: HTMLElement;
  private input?: HTMLInputElement;
  private timer?: number;

  componentDidLoad() {
    this.roll();
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }

  componentDidRender() {
    this.internals.setFormValue(this.value);
  }

  @Watch('placeholderWords')
  roll() {
    clearInterval(this.timer);
    this.word = 0;
    const last = Math.min((this.placeholderWords?.length ?? 0) - 1, MAX_ROLLS);
    if (last < 1 || reducedMotion()) return;
    this.timer = window.setInterval(() => {
      this.word += 1;
      if (this.word >= last) clearInterval(this.timer);
    }, ROLL_MS);
  }

  private set(value: string) {
    this.value = value;
    this.crInput.emit(value);
  }

  private clear = () => {
    if (this.value) this.set('');
    this.input?.focus();
  };

  private pick(query: string, text: HTMLElement) {
    if (!reducedMotion()) flyTo(text, this.input!);
    this.set(query);
    this.input?.focus();
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.value) {
      event.preventDefault();
      this.set('');
    } else if (event.key === 'Enter') {
      this.crSubmit.emit(this.value);
      this.internals.form?.requestSubmit();
    }
  };

  private onFocusOut = (event: FocusEvent) => {
    this.focused = this.root!.contains(event.relatedTarget as Node | null);
  };

  render() {
    const m = t(this.el);
    const open = this.focused || !!this.value;
    const words = this.placeholderWords ?? [];
    const rolling = !this.value && words.length > 0;
    return (
      <div class="root" ref={(el) => (this.root = el)} data-open={open ? '' : undefined} onFocusin={() => (this.focused = true)} onFocusout={this.onFocusOut}>
        <div class="bar">
          <button
            type="button"
            class="icon"
            part="icon"
            tabIndex={open ? 0 : -1}
            aria-hidden={open ? undefined : 'true'}
            aria-label={m.searchClear}
            disabled={this.disabled}
            onClick={this.clear}
          >
            <MorphIcon />
          </button>
          <span class="field">
          {rolling && (
            <span class="placeholder" aria-hidden="true">
              {this.placeholder}{' '}
              <span class="window">
                <span class="word" key={this.word}>
                  {words[this.word]}
                </span>
              </span>
            </span>
          )}
          <input
            ref={(el) => (this.input = el)}
            part="control"
            type="search"
            name={this.name}
            value={this.value}
            placeholder={rolling ? undefined : this.placeholder}
            aria-label={this.label}
            disabled={this.disabled}
            autocomplete="off"
            onInput={(event) => this.set((event.target as HTMLInputElement).value)}
            onKeyDown={this.onKeyDown}
          />
          </span>
        </div>
        {!this.value && this.recent?.length ? (
          <div class="recent">
            <span class="recent-title" id="recent-title">
              {m.recentSearches}
            </span>
            <ul aria-labelledby="recent-title">
              {this.recent.map((query) => (
                <li>
                  <button type="button" class="chip" part="chip" disabled={this.disabled} onClick={(event) => this.pick(query, (event.currentTarget as HTMLElement).querySelector('.chip-text')!)}>
                    <ClockIcon />
                    <span class="chip-text">{query}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div role="status">{this.noResults && this.value && <NoResults query={this.value} m={m} />}</div>
        <slot />
      </div>
    );
  }
}
