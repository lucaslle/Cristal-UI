import { Build, Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { ChartSeries, ChartType, MAX_SERIES, formatters, valuesOf, percent, pointText, slicesOf } from '../../utils/chart-scale';
import { DataTable, Legend } from '../../utils/chart-parts';
import { Plot } from '../../utils/chart-plot';
import { Bars, Donut } from '../../utils/chart-shapes';

/** Diamètre du donut : la légende se place à côté (assez de largeur) ou dessous (environ 22 px par part). */
const ringSize = (width: number, height: number, parts: number) => Math.max(80, width >= 420 ? Math.min(height, width - 200) : Math.min(width, height - parts * 22 - 16));

const KEYS: Record<string, (index: number, count: number) => number> = {
  ArrowRight: (i, n) => Math.min(n - 1, i + 1),
  ArrowDown: (i, n) => Math.min(n - 1, i + 1),
  ArrowLeft: (i) => Math.max(0, i - 1),
  ArrowUp: (i) => Math.max(0, i - 1),
  Home: () => 0,
  End: (_, n) => n - 1,
};

/**
 * Graphique : colonnes, barres horizontales, courbe, surface ou donut, aux couleurs de la palette --cr-color-chart-1 à 8.
 * Chaque valeur se lit au survol, au clavier (flèches) et dans le tableau « Afficher les données ».
 * @part plot - La zone du dessin.
 * @part data - Le tableau des données.
 */
@Component({
  tag: 'cr-chart',
  styleUrls: ['cr-chart.css', 'chart-marks.css'],
  shadow: true,
})
export class CrChart {
  @Element() el!: HTMLElement;

  /** Titre du graphique, aussi son nom pour les lecteurs d'écran (obligatoire). */
  @Prop() label!: string;
  /** Masque visuellement le titre, quand la carte qui contient le graphique l'affiche déjà. */
  @Prop() hideLabel = false;
  /** column (colonnes, évolution), bar (barres horizontales, classement), line, area (courbe et surface) ou donut (parts d'un tout). */
  @Prop({ reflect: true }) type: ChartType = 'column';
  /** Les catégories, dans l'ordre : mois, produits… */
  @Prop() labels: string[] = [];
  /** Les séries : { name, values }, une valeur par catégorie ; 8 au plus. Le donut n'utilise que la première. */
  @Prop() series: ChartSeries[] = [];
  /** Mise en forme des valeurs (Intl.NumberFormat) : { style: 'currency', currency: 'EUR' }, { style: 'percent' }… */
  @Prop() format?: Intl.NumberFormatOptions;

  @State() active?: number;
  @State() width = 480;
  @State() height = 240;
  @State() showData = false;
  @State() message = '';

  private resize?: ResizeObserver;
  private plot?: HTMLElement;

  @Watch('labels')
  @Watch('series')
  @Watch('type')
  dataChanged() {
    this.active = undefined;
  }

  disconnectedCallback() {
    this.resize?.disconnect();
    this.resize = undefined;
  }

  componentDidRender() {
    if (!Build.isBrowser || this.resize || !this.plot) return;
    // Le dessin suit la taille réelle, en pixels : traits et textes gardent leur taille quel que soit le conteneur.
    this.resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height && (Math.round(width) !== this.width || Math.round(height) !== this.height)) [this.width, this.height] = [Math.round(width), Math.round(height)];
    });
    this.resize.observe(this.plot);
  }

  private onKey(event: KeyboardEvent, count: number, describe: (index: number) => string) {
    if (event.key === 'Escape') return (this.active = undefined);
    const move = KEYS[event.key];
    if (!move || !count) return;
    event.preventDefault();
    this.active = move(this.active ?? -1, count);
    this.message = describe(this.active);
  }

  render() {
    const m = t(this.el);
    const series = this.series.slice(0, MAX_SERIES);
    const all = valuesOf(series);
    const { value, tick } = formatters(m.locale, this.format, Math.max(0, ...all.map(Math.abs)));
    const donut = this.type === 'donut';
    const slices = donut ? slicesOf(this.labels, series, m) : [];
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    const share = (v: number) => percent(v, total, m.locale);
    const names = donut ? slices.map((slice) => slice.label) : this.labels;
    const rows = donut ? [{ name: series[0]?.name ?? this.label, values: slices.map((slice) => slice.value) }] : series;
    const count = names.length;
    const describe = (i: number) => (donut ? m.chartPoint(names[i], `${value(slices[i].value)}, ${share(slices[i].value)}`) : pointText(names[i], series, i, value, m));
    const onActive = (i: number) => (this.active = i);
    const empty = !count || !all.length;
    return (
      <Host>
        <div class="head">
          <span id="title" class={{ title: true, 'sr-only': this.hideLabel }}>
            {this.label}
          </span>
          <button class="toggle" type="button" aria-expanded={this.showData ? 'true' : 'false'} aria-controls="data" onClick={() => (this.showData = !this.showData)}>
            {this.showData ? m.chartHideData : m.chartShowData}
          </button>
        </div>
        {!donut && series.length > 1 && <Legend names={series.map((s) => s.name)} line={this.type === 'line' || this.type === 'area'} />}
        <div
          ref={(el) => (this.plot = el)}
          class="plot"
          part="plot"
          role="group"
          tabindex={empty ? undefined : '0'}
          aria-labelledby="title"
          aria-describedby="hint"
          onKeyDown={(event) => this.onKey(event, count, describe)}
          onPointerLeave={() => (this.active = undefined)}
          onBlur={() => (this.active = undefined)}
        >
          {empty ? (
            <p class="empty">{m.chartEmpty}</p>
          ) : donut ? (
            <Donut {...{ slices, value, share, onActive, active: this.active }} size={ringSize(this.width, this.height, slices.length)} totalLabel={m.chartTotal} />
          ) : this.type === 'bar' ? (
            <Bars {...{ labels: this.labels, series, value, onActive, active: this.active }} />
          ) : (
            <Plot {...{ type: this.type as 'column' | 'line' | 'area', labels: this.labels, series, value, tick, onActive, active: this.active, width: this.width, height: this.height }} />
          )}
        </div>
        <p id="hint" class="sr-only">
          {m.chartHelp}
        </p>
        <div id="data" class="data-wrap" part="data" hidden={!this.showData}>
          <DataTable label={this.label} labels={names} series={rows} value={value} share={donut ? share : undefined} m={m} />
        </div>
        <p class="sr-only" role="status">
          {this.message}
        </p>
      </Host>
    );
  }
}
