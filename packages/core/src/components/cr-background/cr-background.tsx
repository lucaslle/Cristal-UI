import { Build, Component, Element, Host, Prop, State, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { Particles } from '../../utils/background-particles';

export type BackgroundVariant = 'aurora' | 'gradient' | 'grid' | 'dots' | 'waves' | 'particles';

// Nombre d'éléments animés de chaque effet en CSS ; particles dessine dans un canvas.
const pieces: Record<Exclude<BackgroundVariant, 'particles'>, number> = { aurora: 4, gradient: 2, grid: 1, dots: 1, waves: 3 };
const wave = 'M0 50 Q180 14 360 50 T720 50 T1080 50 T1440 50 V100 H0 Z';

/**
 * Fond animé décoratif derrière un contenu (bandeau d'accueil, section, carte) : le contenu reste dans la page, lisible et cliquable.
 * Les couleurs viennent du thème. Un bouton dans le coin met l'animation en pause ; elle démarre en pause quand l'utilisateur
 * a demandé à réduire les animations, et s'arrête d'elle-même hors de l'écran ou quand l'onglet est caché.
 * @slot - Le contenu affiché par-dessus le fond.
 * @part layer - La couche animée, décorative.
 * @part toggle - Le bouton pause.
 */
@Component({
  tag: 'cr-background',
  styleUrl: 'cr-background.css',
  shadow: true,
})
export class CrBackground {
  @Element() el!: HTMLCrBackgroundElement;

  /** Effet : aurora (halos de couleur qui dérivent, par défaut), gradient (dégradé qui glisse), grid (grille en perspective), dots (points traversés par une vague), waves (vagues) ou particles (points reliés, dessinés dans un canvas). */
  @Prop({ reflect: true }) variant: BackgroundVariant = 'aurora';
  /** Affiche le bouton pause dans le coin. À false seulement si l'application a sa propre commande pour arrêter les animations. */
  @Prop() controls = true;
  /** Avec particles, les points s'écartent du pointeur et s'y relient par des traits ; sans effet sur les autres variants. */
  @Prop() interactive = true;
  /** Met l'animation en pause ; le bouton pause l'inverse. Passe à true au chargement si l'utilisateur a demandé à réduire les animations. */
  @Prop({ mutable: true, reflect: true }) paused = false;

  /** Le fond est à l'écran et l'onglet est affiché. */
  @State() shown = false;

  private onScreen = false;
  private observer?: IntersectionObserver;
  private canvas?: HTMLCanvasElement;
  private particles?: Particles;

  componentWillLoad() {
    if (Build.isBrowser && matchMedia('(prefers-reduced-motion: reduce)').matches) this.paused = true;
  }

  connectedCallback() {
    if (!Build.isBrowser) return;
    this.observer = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.updateShown();
    });
    this.observer.observe(this.el);
    document.addEventListener('visibilitychange', this.updateShown);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.updateShown);
    this.particles?.destroy();
    this.particles = undefined;
  }

  componentDidRender() {
    if (this.variant !== 'particles' || !this.canvas) {
      this.particles?.destroy();
      this.particles = undefined;
      return;
    }
    this.particles ??= new Particles(this.canvas);
    this.particles.toggle(this.shown && !this.paused);
  }

  private onPointer = (event: PointerEvent) => {
    const box = this.canvas?.getBoundingClientRect();
    const inside = this.interactive && box && event.type !== 'pointerleave';
    this.particles?.point(inside ? { x: event.clientX - box.left, y: event.clientY - box.top } : undefined);
  };

  private updateShown = () => {
    this.shown = this.onScreen && !document.hidden;
  };

  private renderEffect() {
    if (this.variant === 'particles') return <canvas ref={(el) => (this.canvas = el)} />;
    if (this.variant === 'waves') {
      return [1, 2, 3].map(() => (
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d={wave} />
        </svg>
      ));
    }
    if (this.variant === 'dots') {
      return (
        <div class="band">
          <div class="spark" />
        </div>
      );
    }
    return Array.from({ length: pieces[this.variant] ?? pieces.aurora }, () => <div class="piece" />);
  }

  render() {
    const running = this.shown && !this.paused;
    return (
      <Host onPointerMove={this.onPointer} onPointerLeave={this.onPointer}>
        <div class="layer" part="layer" aria-hidden="true" data-running={running ? '' : undefined}>
          {this.renderEffect()}
        </div>
        <slot />
        {this.controls && (
          <button type="button" class="toggle" part="toggle" aria-pressed={String(this.paused)} onClick={() => (this.paused = !this.paused)}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d={this.paused ? 'M8 5.5v13l10.5-6.5z' : 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z'} fill="currentColor" />
            </svg>
            <span class="sr-only">{t(this.el).pauseAnimation}</span>
          </button>
        )}
      </Host>
    );
  }
}
