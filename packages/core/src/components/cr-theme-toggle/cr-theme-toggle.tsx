import { Build, Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { themeIcon, type ThemeToggleIcon } from '../../utils/theme-toggle-views';
import { themeTransition, type ThemeTransition } from '../../utils/theme-transitions';

export type Theme = 'light' | 'dark';
export type ThemeToggleVariant = 'icon' | 'switch' | 'label';

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } };

/** Thème de la page : data-theme sur <html>, sinon la préférence du système. */
const pageTheme = (): Theme => {
  const theme = document.documentElement.dataset.theme;
  if (theme === 'dark' || theme === 'light') return theme;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Bascule entre thème clair et thème sombre : un bouton rond, un interrupteur ou un bouton avec libellé, dont le soleil devient une lune.
 * Pose data-theme sur <html> (le thème sombre de @cristal/tokens/tokens-dark.css), avec une transition animée sur toute la page.
 * Suit aussi les changements de data-theme faits ailleurs (sélecteur de thème de l'application). Garder le choix est laissé à l'application.
 * @part button - Le bouton natif (le rail pour l'interrupteur).
 * @part thumb - La pastille de l'interrupteur, qui porte l'icône.
 * @part icon - L'icône soleil / lune.
 */
@Component({
  tag: 'cr-theme-toggle',
  styleUrls: ['cr-theme-toggle.css', 'theme-toggle-switch.css', 'theme-toggle-icons.css', 'theme-toggle-icons-3d.css'],
  shadow: { delegatesFocus: true },
})
export class CrThemeToggle {
  @Element() el!: HTMLCrThemeToggleElement;

  /** Thème affiché ; au chargement, celui de data-theme sur <html>, sinon la préférence du système. Pour en changer depuis l'application, posez data-theme sur <html> : la bascule suit. */
  @Prop({ mutable: true, reflect: true }) theme: Theme = 'light';
  /** Passage d'un thème à l'autre : circle (cercle depuis le bouton, par défaut), curtain (rideau qui tombe), blinds (bandes de haut en bas), flip (la page se retourne), eclipse (disque qui glisse), sweep (aiguille d'horloge) ou none. Instantané si l'utilisateur réduit les animations ou si le navigateur ne connaît pas les transitions de vue. */
  @Prop({ reflect: true }) transition: ThemeTransition = 'circle';
  /** Forme de la bascule : icon (bouton rond, par défaut), switch (interrupteur dont la pastille glisse, rôle switch) ou label (bouton avec l'icône et le libellé « Thème sombre » visible). */
  @Prop({ reflect: true }) variant: ThemeToggleVariant = 'icon';
  /** Animation de l'icône : morph (le soleil devient une lune, par défaut), rotate (le soleil tourne et rapetisse, la lune arrive en tournant), rise (le soleil se couche sous l'horizon, la lune se lève), flip (pièce qui se retourne) ou eclipse (un disque passe devant le soleil, les rayons deviennent des étoiles). */
  @Prop({ reflect: true }) icon: ThemeToggleIcon = 'morph';

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
    const box = (this.el.shadowRoot!.querySelector('.thumb') ?? this.button!).getBoundingClientRect();
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
    const dark = String(this.theme === 'dark');
    const name = t(this.el).darkTheme;
    const icon = themeIcon(this.icon);
    const common = { ref: (el?: HTMLButtonElement) => (this.button = el), type: 'button' as const, part: 'button', onClick: this.toggle };
    if (this.variant === 'switch')
      return (
        <button {...common} class="switch" role="switch" aria-checked={dark} aria-label={name}>
          <span class="thumb" part="thumb">
            {icon}
          </span>
        </button>
      );
    // Libellé visible constant : le nom accessible est exactement le texte affiché, l'état passe par aria-pressed.
    if (this.variant === 'label')
      return (
        <button {...common} class="button pill" aria-pressed={dark}>
          {icon}
          <span class="text">{name}</span>
        </button>
      );
    return (
      <button {...common} class="button" aria-pressed={dark} aria-label={name}>
        {icon}
      </button>
    );
  }
}
