import { Build, Component, Element, Host, Prop, State, h } from '@stencil/core';
import { PauseToggle } from '../../utils/pause-toggle';
import { Weather, type WeatherCondition } from '../../utils/weather-engine';

/**
 * Carte de verre dépoli dont le temps qu'il fait se voit sur le verre : gouttes qui perlent et coulent, buée, givre, chaleur, vent.
 * Le contenu (ville, température, détails) est celui de l'application, dans la page, lisible et cliquable ; l'effet est décoratif,
 * derrière lui. Un bouton dans le coin met l'animation en pause ; elle démarre en pause, sur une image fixe, quand l'utilisateur
 * a demandé à réduire les animations, et s'arrête d'elle-même hors de l'écran ou quand l'onglet est caché.
 * @slot - Le contenu de la carte.
 * @part layer - La couche de l'effet, décorative.
 * @part toggle - Le bouton pause.
 */
@Component({
  tag: 'cr-weather',
  styleUrls: ['cr-weather.css', '../../global/pause-toggle.css'],
  shadow: true,
})
export class CrWeather {
  @Element() el!: HTMLCrWeatherElement;

  /** Temps sur le verre : clear (dégagé, reflets de soleil, par défaut), rain (pluie fine, gouttes qui perlent et coulent), storm (forte pluie), fog (buée que le pointeur essuie), frost (givre qui pousse depuis les bords), heat (chaleur qui monte et fait onduler les reflets) ou wind (vent, filets d'air et feuilles). Un changement passe d'un effet à l'autre en fondu. */
  @Prop({ reflect: true }) condition: WeatherCondition = 'clear';
  /** Affiche le bouton pause dans le coin. À false seulement si l'application a sa propre commande pour arrêter les animations. */
  @Prop() controls = true;
  /** Met l'animation en pause ; le bouton pause l'inverse. Passe à true au chargement si l'utilisateur a demandé à réduire les animations. */
  @Prop({ mutable: true, reflect: true }) paused = false;

  /** La carte est à l'écran et l'onglet est affiché. */
  @State() shown = false;

  private onScreen = false;
  private observer?: IntersectionObserver;
  private canvas?: HTMLCanvasElement;
  private weather?: Weather;

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
    this.weather?.destroy();
    this.weather = undefined;
  }

  componentDidRender() {
    if (!this.canvas) return;
    this.weather ??= new Weather(this.canvas);
    this.weather.update(this.condition, this.shown && !this.paused, this.paused);
  }

  // Le doigt sur la vitre embuée : pure décoration, aucune information n'en dépend.
  private onPointer = (event: PointerEvent) => {
    if (this.condition !== 'fog' || !this.canvas) return;
    const box = this.canvas.getBoundingClientRect();
    this.weather?.wipe(event.clientX - box.left, event.clientY - box.top);
  };

  private updateShown = () => {
    this.shown = this.onScreen && !document.hidden;
  };

  render() {
    return (
      <Host onPointerMove={this.onPointer}>
        <div class="layer" part="layer" aria-hidden="true">
          <canvas ref={(el) => (this.canvas = el)} />
        </div>
        <slot />
        {this.controls && <PauseToggle host={this.el} paused={this.paused} onToggle={() => (this.paused = !this.paused)} />}
      </Host>
    );
  }
}
