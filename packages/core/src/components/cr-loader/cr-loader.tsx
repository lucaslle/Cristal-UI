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

  /** Style : spinner (cercle qui tourne), bounce (balle qui rebondit et s'écrase en touchant le sol) ou search (loupe qui glisse, pour une recherche). */
  @Prop({ reflect: true }) variant: 'spinner' | 'bounce' | 'search' = 'spinner';
  /** Texte lu par les lecteurs d'écran (« Chargement… » par défaut). */
  @Prop() label?: string;

  render() {
    return (
      <Host role="status">
        <span class={this.variant} part="indicator" aria-hidden="true">
          {this.variant === 'bounce' && [<span class="ball" />, <span class="shadow" />]}
          {this.variant === 'search' && (
            <svg class="lens" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round">
              <circle cx="10" cy="10" r="6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" />
            </svg>
          )}
        </span>
        <span class="sr-only">{this.label ?? t(this.el).loading}</span>
      </Host>
    );
  }
}
