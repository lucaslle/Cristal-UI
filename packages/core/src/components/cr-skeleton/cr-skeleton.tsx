import { Component, Host, Prop, h } from '@stencil/core';

/**
 * Forme grise qui pulse à la place d'un contenu en cours de chargement.
 * Masquée des lecteurs d'écran : signalez le chargement sur le conteneur (aria-busy) ou avec cr-loader.
 */
@Component({
  tag: 'cr-skeleton',
  styleUrl: 'cr-skeleton.css',
  shadow: true,
})
export class CrSkeleton {
  /** Forme : line (ligne de texte), block (image, carte) ou circle (avatar). */
  @Prop({ reflect: true }) shape: 'line' | 'block' | 'circle' = 'line';
  /** Largeur, toute valeur CSS (« 60% », « 120px »). */
  @Prop() width?: string;
  /** Hauteur, toute valeur CSS. */
  @Prop() height?: string;

  render() {
    return <Host aria-hidden="true" style={{ width: this.width, height: this.height }} />;
  }
}
