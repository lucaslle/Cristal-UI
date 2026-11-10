import { Build, Component, Element, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { coordinates, heights, morph, resample, trend } from '../../utils/sparkline';

/**
 * Mini-graphique en ligne : l'allure d'une série de nombres, à glisser dans un texte, une carte ou un tableau.
 * C'est une image nommée par son libellé et un résumé (dernière valeur, minimum, maximum, tendance).
 * La ligne se trace au premier affichage ; quand les valeurs changent, elle glisse point par point vers les nouvelles.
 * @part svg - Le dessin.
 */
@Component({
  tag: 'cr-sparkline',
  styleUrl: 'cr-sparkline.css',
  shadow: true,
})
export class CrSparkline {
  @Element() el!: HTMLCrSparklineElement;

  /** Les valeurs, dans l'ordre (en JavaScript ou en React : un tableau de nombres). */
  @Prop() values: number[] = [];
  /** Ce que mesurent les valeurs (« Ventes de la semaine ») ; début du nom lu par les lecteurs d'écran (obligatoire). */
  @Prop() label!: string;
  /** Style : line (ligne seule) ou area (ligne et surface teintée dessous). */
  @Prop({ reflect: true }) variant: 'line' | 'area' = 'line';

  /** Hauteurs affichées, de 0 à 1 : celles des valeurs, ou les intermédiaires pendant la transformation. */
  @State() points: number[] = [];
  @State() size = { width: 120, height: 32 };

  private stop?: () => void;
  private resize?: ResizeObserver;

  componentWillLoad() {
    this.points = heights(this.values ?? []);
  }

  disconnectedCallback() {
    this.stop?.();
    this.resize?.disconnect();
    this.resize = undefined;
  }

  componentDidRender() {
    if (!Build.isBrowser || this.resize) return;
    // Le dessin suit la taille réelle, en pixels : pas d'étirement du trait, et le tracé (pathLength) reste juste.
    this.resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height && (width !== this.size.width || height !== this.size.height)) this.size = { width, height };
    });
    this.resize.observe(this.el);
  }

  @Watch('values')
  valuesChanged() {
    this.stop?.();
    const next = heights(this.values ?? []);
    if (!this.points.length || !next.length || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.points = next;
      return;
    }
    this.stop = morph(resample(this.points, next.length), next, (points) => (this.points = points));
  }

  private name() {
    const values = this.values ?? [];
    if (!values.length) return this.label;
    const m = t(this.el);
    const format = (value: number) => new Intl.NumberFormat(m.locale).format(value);
    return m.sparkline(this.label, format(Math.min(...values)), format(Math.max(...values)), format(values[values.length - 1]), trend(values));
  }

  render() {
    const { width, height } = this.size;
    const xy = coordinates(this.points, width, height);
    const line = xy.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
    const last = xy[xy.length - 1];
    return (
      <svg class="svg" part="svg" role="img" aria-label={this.name()} viewBox={`0 0 ${width} ${height}`}>
        {last && [
          this.variant === 'area' && <path class="area" d={`${line}L${last[0].toFixed(1)} ${height}L${xy[0][0].toFixed(1)} ${height}Z`} />,
          <path class="line" d={line} pathLength="1" />,
          <circle class="dot" cx={last[0].toFixed(1)} cy={last[1].toFixed(1)} r="2.5" />,
        ]}
      </svg>
    );
  }
}
