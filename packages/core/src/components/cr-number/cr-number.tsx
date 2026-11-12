import { Component, Element, Host, Prop, State, Watch, h } from '@stencil/core';
import { t } from '../../utils/i18n';
import { formatNumber, numberParts, reducedMotion, scramble, tween } from '../../utils/number-format';
import { type NumberAnimation, type NumberChange, renderParts } from '../../utils/number-views';

const COUNT_MS = 800;
const DECODE_MS = 600;
// Le temps que la plus longue animation (le comptage et sa teinte) se termine.
const SETTLE_MS = 1400;

/**
 * Nombre animé : quand value change, les chiffres passent à la nouvelle valeur en s'animant, au choix (animation).
 * Il prend la taille, la graisse et la couleur du texte autour ; les chiffres ont tous la même largeur.
 * Le nombre est formaté dans la langue de la page ; les lecteurs d'écran et le copier-coller lisent directement la valeur finale.
 */
@Component({
  tag: 'cr-number',
  styleUrls: ['cr-number.css', 'flap.css'],
  shadow: true,
})
export class CrNumber {
  @Element() el!: HTMLCrNumberElement;

  /** Le nombre affiché. */
  @Prop() value = 0;
  /** Nombre de décimales affichées (le nombre est arrondi). */
  @Prop() decimals = 0;
  /**
   * Animation quand value change : roll (compteur kilométrique, par défaut), flap (tableau d'aéroport), blur (le nombre glisse, flouté),
   * stagger (les chiffres changent un à un, avec rebond), decode (les chiffres défilent au hasard puis se figent), count (le nombre compte jusqu'à la nouvelle valeur).
   */
  @Prop({ reflect: true }) animation: NumberAnimation = 'roll';

  /** Valeur affichée par count pendant qu'il compte. */
  @State() shown = 0;
  @State() change?: NumberChange;
  /** Chiffres brouillés par decode, par indice de caractère. */
  @State() scrambled?: string[];

  private runs = 0;
  private stop?: () => void;
  private settle?: ReturnType<typeof setTimeout>;

  componentWillLoad() {
    this.shown = this.value;
  }

  disconnectedCallback() {
    this.stop?.();
    clearTimeout(this.settle);
  }

  private parts(value: number) {
    return numberParts(value, this.decimals, t(this.el).locale);
  }

  @Watch('value')
  valueChanged(next: number, previous: number) {
    this.stop?.();
    this.stop = undefined;
    clearTimeout(this.settle);
    this.scrambled = undefined;
    if (reducedMotion() || next === previous) {
      this.shown = next;
      this.change = undefined;
      return;
    }
    const before = this.parts(this.animation === 'count' ? this.shown : previous);
    this.change = { before: new Map(before.filter((part) => part.digit).map((part) => [part.key, part.char])), trend: next > previous ? 'up' : 'down', run: ++this.runs };
    this.settle = setTimeout(() => (this.change = undefined), SETTLE_MS);
    if (this.animation === 'count') {
      this.stop = tween(this.shown, next, COUNT_MS, (value) => (this.shown = value));
      return;
    }
    this.shown = next;
    if (this.animation === 'decode') this.stop = scramble(this.parts(next), DECODE_MS, (chars) => (this.scrambled = chars));
  }

  render() {
    const count = this.animation === 'count';
    const trend = count ? this.change?.trend : undefined;
    return (
      <Host>
        {/* Les chiffres animés sont pour les yeux ; les lecteurs d'écran lisent la valeur finale, juste après. */}
        <span class={{ digits: true, [`trend-${trend}`]: !!trend }} data-trend={this.change?.trend} aria-hidden="true">
          {trend && <span key={`marker-${this.change!.run}`} class="marker" />}
          {renderParts(this.animation, this.parts(count ? this.shown : this.value), this.change, this.scrambled)}
        </span>
        <span class="sr-only">{formatNumber(this.parts(this.value))}</span>
      </Host>
    );
  }
}
