import { Component, Host, Prop, State, Watch, h } from '@stencil/core';

/**
 * Image qui apparaît floue puis devient nette en 2 s une fois chargée (blur-up), avec un léger dézoom.
 * Donnez une taille au composant (width, height ou aspect-ratio) : l'image le remplit.
 * @part image - L'élément img.
 */
@Component({
  tag: 'cr-image',
  styleUrl: 'cr-image.css',
  shadow: true,
})
export class CrImage {
  /** Adresse de l'image. */
  @Prop() src!: string;
  /** Texte alternatif ; chaîne vide pour une image décorative. */
  @Prop() alt!: string;

  @State() loaded = false;
  private img?: HTMLImageElement;

  @Watch('src')
  reset() {
    this.loaded = false;
  }

  componentDidLoad() {
    // Image déjà en cache, ou chargée avant l'hydratation : load ne viendra plus.
    if (this.img?.complete) this.loaded = true;
  }

  render() {
    const done = () => (this.loaded = true);
    return (
      <Host data-loaded={this.loaded ? '' : undefined}>
        <img ref={(el) => (this.img = el)} part="image" src={this.src} alt={this.alt} loading="lazy" decoding="async" onLoad={done} onError={done} />
      </Host>
    );
  }
}
