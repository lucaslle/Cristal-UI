import { Component, Prop, h } from '@stencil/core';

/**
 * Contenu d'un onglet, enfant de cr-segmented (mode onglets). Seul le panneau de l'onglet choisi est affiché.
 * @slot - Le contenu du panneau.
 */
@Component({
  tag: 'cr-tab-panel',
  styleUrl: 'cr-tab-panel.css',
  shadow: true,
})
export class CrTabPanel {
  /** Libellé de l'onglet. */
  @Prop({ reflect: true }) label!: string;
  /** Valeur de l'onglet, reprise par value et crChange de cr-segmented ; sa position en texte ("0", "1"…) par défaut. */
  @Prop({ reflect: true }) value?: string;

  render() {
    return <slot />;
  }
}
