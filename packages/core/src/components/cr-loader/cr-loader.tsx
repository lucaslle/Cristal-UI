import { Component, Element, Host, Prop, h } from '@stencil/core';
import { t } from '../../utils/i18n';

/**
 * Indicateur de chargement de durée inconnue. Sa taille suit la taille du texte (font-size).
 * @part indicator - Le cercle ou la balle.
 */
@Component({
  tag: 'cr-loader',
  styleUrl: 'cr-loader.css',
  shadow: true,
})
export class CrLoader {
  @Element() el!: HTMLCrLoaderElement;

  /** Style : spinner (cercle qui tourne) ou bounce (balle qui rebondit et s'écrase en touchant le sol). */
  @Prop({ reflect: true }) variant: 'spinner' | 'bounce' = 'spinner';
  /** Texte lu par les lecteurs d'écran (« Chargement… » par défaut). */
  @Prop() label?: string;

  render() {
    return (
      <Host role="status">
        <span class={this.variant} part="indicator" aria-hidden="true">
          {this.variant === 'bounce' && [<span class="ball" />, <span class="shadow" />]}
        </span>
        <span class="sr-only">{this.label ?? t(this.el).loading}</span>
      </Host>
    );
  }
}
