import { Component, Prop, h } from '@stencil/core';

/**
 * Contenu d'un onglet, enfant de cr-tabs. Seul le panneau de l'onglet choisi est affiché.
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

  render() {
    return <slot />;
  }
}
