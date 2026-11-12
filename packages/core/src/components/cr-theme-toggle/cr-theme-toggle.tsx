import { Build, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { themeTransition, type ThemeTransition } from '../../utils/theme-transitions';

export type Theme = 'light' | 'dark';

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } };

const rays = Array.from({ length: 8 }, (_, index) => index * 45);

/** Thème de la page : data-theme sur <html>, sinon la préférence du système. */
const pageTheme = (): Theme => {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark' || theme === 'light') return theme;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Bascule entre thème clair et thème sombre : un bouton rond dont le soleil devient une lune.
 * Pose data-theme sur <html> (le thème sombre de @cristal/tokens/tokens-dark.css), avec une transition animée sur toute la page.
 * Suit aussi les changements de data-theme faits ailleurs (sélecteur de thème de l'application). Garder le choix est laissé à l'application.
 * @part button - Le bouton natif.
 * @part icon - L'icône soleil / lune.
 */
@Component({
  tag: 'cr-theme-toggle',
  styleUrl: 'cr-theme-toggle.css',
  shadow: { delegatesFocus: true },
})
export class CrThemeToggle {
  @Element() el!: HTMLCrThemeToggleElement;

  /** Thème affiché ; au chargement, celui de data-theme sur <html>, sinon la préférence du système. Pour en changer depuis l'application, posez data-theme sur <html> : la bascule suit. */
  @Prop({ mutable: true, reflect: true }) theme: Theme = 'light';
  /** Passage d'un thème à l'autre : circle (cercle depuis le bouton, par défaut), curtain (rideau qui tombe), blinds (bandes de haut en bas), flip (la page se retourne), eclipse (disque qui glisse), sweep (aiguille d'horloge) ou none. Instantané si l'utilisateur réduit les animations ou si le navigateur ne connaît pas les transitions de vue. */
  @Prop({ reflect: true }) transition: ThemeTransition = 'circle';

  /** Émis après chaque changement de thème par la bascule, une fois data-theme posé ; detail : le nouveau thème. */
  @Event() crChange: EventEmitter<Theme>;

  private button?: HTMLButtonElement;
  private observer?: MutationObserver;

  connectedCallback() {
    if (!Build.isBrowser) return;
    this.theme = pageTheme();
    this.observer = new MutationObserver(() => (this.theme = pageTheme()));
    this.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private toggle = () => {
    const next: Theme = this.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.dataset.theme = next;
      this.theme = next;
      this.crChange.emit(next);
    };
    const doc = document as ViewTransitionDocument;
    if (this.transition === 'none' || !doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
    const box = this.button!.getBoundingClientRect();
    const origin = { x: box.left + box.width / 2, y: box.top + box.height / 2, width: innerWidth, height: innerHeight };
    const layers = themeTransition(this.transition, origin);
    doc
      .startViewTransition(apply)
      .ready.then(() => {
        for (const { pseudo, keyframes, options } of layers) {
          document.documentElement.animate(keyframes, { ...options, fill: 'both', pseudoElement: pseudo === 'backdrop' ? '::view-transition' : `::view-transition-${pseudo}(root)` });
        }
      })
      // ready rejette quand la transition est sautée (nouveau clic pendant la précédente) : le thème est déjà posé.
      .catch(() => {});
  };

  render() {
    const dark = this.theme === 'dark';
    return (
      <button ref={(el) => (this.button = el)} type="button" class="button" part="button" aria-pressed={String(dark)} aria-label={t(this.el).darkTheme} onClick={this.toggle}>
        <svg class="icon" part="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <mask id="crescent">
            <rect width="24" height="24" fill="white" />
            <circle class="bite" cx="12" cy="12" r="7" fill="black" />
          </mask>
          <circle class="disc" cx="12" cy="12" r="8.5" fill="currentColor" mask="url(#crescent)" />
          <g class="rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            {rays.map((angle) => (
              <line x1="12" y1="1.75" x2="12" y2="4.25" transform={`rotate(${angle} 12 12)`} />
            ))}
          </g>
        </svg>
      </button>
    );
  }
}
